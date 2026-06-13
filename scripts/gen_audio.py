#!/usr/bin/env python3
"""
Bloom — The Fluffy Bunny Café
scripts/gen_audio.py — synthesises the placeholder SFX + ambient loop.

These are tasteful, soft, royalty-free synth tones generated from scratch
(Python stdlib only) so the build has real audio "feel" without needing
sourced assets. Replace any of them later with recorded/produced audio of
the same filename in src/assets/sounds/.

Run:  python3 scripts/gen_audio.py
"""

import math
import struct
import wave
import os

SR = 44100  # sample rate
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "sounds")

A4 = 440.0
def note(semitones_from_a4: float) -> float:
    return A4 * (2.0 ** (semitones_from_a4 / 12.0))

# A few named notes (semitone offsets from A4)
N = {
    "A4": 0, "C5": 3, "D5": 5, "E5": 7, "G5": 10,
    "C6": 15, "E6": 19, "G6": 22,
    "C3": -21, "E4": -5, "G3": -14,
}


def write_wav(name: str, samples):
    # clamp + convert to 16-bit PCM
    frames = bytearray()
    for s in samples:
        v = max(-1.0, min(1.0, s))
        frames += struct.pack("<h", int(v * 32767))
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    print(f"  wrote {name}  ({len(samples)/SR:.2f}s)")


def adsr(i, total, attack, release):
    """Simple attack/release envelope in [0,1] over a one-shot."""
    t = i / SR
    dur = total / SR
    if t < attack:
        return t / attack
    if t > dur - release:
        return max(0.0, (dur - t) / release)
    return 1.0


def bell(freq, dur_s, gain=0.5, attack=0.005):
    """A soft bell: fundamental + gentle harmonics, exponential decay."""
    total = int(dur_s * SR)
    out = []
    for i in range(total):
        t = i / SR
        decay = math.exp(-3.5 * t / dur_s)
        env = decay * adsr(i, total, attack, 0.02)
        s = (
            1.00 * math.sin(2 * math.pi * freq * t)
            + 0.45 * math.sin(2 * math.pi * freq * 2 * t)
            + 0.20 * math.sin(2 * math.pi * freq * 3 * t)
        )
        out.append(gain * env * s / 1.65)
    return out


def mix(*layers):
    """Sum equal-length-or-not layers, padding the shorter ones."""
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i, s in enumerate(l):
            out[i] += s
    return out


def gen_merge():
    # warm two-note "ding" — the critical merge feel: C5 with an E5 shimmer
    a = bell(note(N["C5"]), 0.40, gain=0.55)
    b = bell(note(N["E5"]), 0.40, gain=0.30)
    write_wav("merge.wav", mix(a, b))


def gen_spawn():
    # short soft pluck — a quiet A4 tick
    write_wav("spawn.wav", bell(note(N["A4"]), 0.14, gain=0.35))


def gen_levelup():
    # gentle ascending arpeggio C5 E5 G5 C6
    seq = ["C5", "E5", "G5", "C6"]
    step = int(0.11 * SR)
    out = []
    for idx, nm in enumerate(seq):
        tone = bell(note(N[nm]), 0.45, gain=0.5)
        start = idx * step
        if len(out) < start + len(tone):
            out += [0.0] * (start + len(tone) - len(out))
        for i, s in enumerate(tone):
            out[start + i] += s
    write_wav("levelup.wav", out)


def gen_sparkle():
    # light shimmer for story / Brigadier beats — high, soft, brief
    a = bell(note(N["E6"]), 0.5, gain=0.22)
    b = bell(note(N["G6"]), 0.5, gain=0.16)
    write_wav("sparkle.wav", mix(a, b))


def gen_ambient():
    # soft warm pad that loops seamlessly. Frequencies snapped to multiples of
    # (1/duration) so every partial completes whole cycles → click-free loop.
    dur = 8.0
    total = int(dur * SR)
    unit = 1.0 / dur

    def snap(f):
        return round(f / unit) * unit

    chord = [snap(note(N["C3"])), snap(note(N["G3"])), snap(note(N["E4"]))]
    lfo = snap(0.125)  # slow breathing, whole cycles over the loop
    out = []
    for i in range(total):
        t = i / SR
        breathe = 0.85 + 0.15 * math.sin(2 * math.pi * lfo * t)
        s = sum(math.sin(2 * math.pi * f * t) for f in chord) / len(chord)
        out.append(0.12 * breathe * s)  # intentionally quiet — it sits under play
    write_wav("ambient.wav", out)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Generating Bloom audio →", os.path.normpath(OUT))
    gen_merge()
    gen_spawn()
    gen_levelup()
    gen_sparkle()
    gen_ambient()
    print("Done.")
