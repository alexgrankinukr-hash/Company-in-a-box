# AICIB Demo Recording Checklist

> Use this checklist before every recording session.
> Print it out or keep it open in a second window.

---

## 1. Terminal Setup

### Font & Appearance
- [ ] Font size set to **16pt or larger** (so text is readable in a compressed video)
- [ ] Dark background theme (black or near-black -- light themes wash out in recordings)
- [ ] High-contrast text (white or light gray on dark background)
- [ ] No transparency or blur effects on the terminal window
- [ ] Turn off terminal bell / audible notifications

### Prompt
- [ ] Clean, short prompt -- ideally just `~ $` or `freelancerpm $`
- [ ] Remove any long directory paths, git branch indicators, or timestamps from the prompt
- [ ] If using Oh My Zsh or Starship, switch to a minimal theme temporarily:
  ```bash
  # Temporary minimal prompt (paste into terminal before recording)
  export PS1="$ "
  ```

### Window Size
- [ ] Terminal window is **120 columns x 35 rows** minimum
- [ ] Check with: `echo "Columns: $(tput cols) Rows: $(tput lines)"`
- [ ] Position the terminal in the center of the screen with some margin
- [ ] No other windows visible behind the terminal

### Clean State
- [ ] Run `clear` immediately before recording
- [ ] No previous command history visible
- [ ] Close all other terminal tabs
- [ ] Turn off notification banners (Do Not Disturb / Focus mode on macOS)

---

## 2. Pre-Flight Technical Checks

### Build & Install
- [ ] Navigate to the aicib project directory
- [ ] Run `npm run build` -- confirm no errors
- [ ] Verify the CLI works: `npx aicib --version`
- [ ] If using a global install: `npm link` and confirm `aicib --version`

### Test Init in a Scratch Directory
- [ ] Create a temporary directory:
  ```bash
  mkdir -p /tmp/demo-test && cd /tmp/demo-test
  ```
- [ ] Run `npx aicib init --name "TestCompany"`
- [ ] Verify the folder structure appears correctly
- [ ] Run `aicib start` -- confirm all agents come online
- [ ] Run a quick brief (use Brief 3 -- "The Quick Win" -- cheapest option):
  ```bash
  aicib brief "Write a one-paragraph competitive analysis of our product vs Trello for freelancers."
  ```
- [ ] Confirm output streams correctly and deliverables are generated
- [ ] Run `aicib status` -- confirm the status table renders properly
- [ ] Run `aicib stop` -- confirm clean shutdown
- [ ] Delete the test directory: `rm -rf /tmp/demo-test`

### Network & Authentication
- [ ] Confirm internet connection is stable (the agents need to reach Claude's API)
- [ ] Confirm authentication is working (the SDK uses your Claude Code subscription)
- [ ] No VPN or firewall that might interfere with API calls
- [ ] Test API response time -- if responses are slow, wait for off-peak hours

---

## 3. Cost Management

### Set Limits
- [ ] Set a daily cost limit of **$20** for the recording session
  ```bash
  aicib cost --daily-limit 20
  ```
- [ ] Verify current spend: `aicib cost`
- [ ] Confirm you are starting from a fresh session (no leftover costs from testing)

### Budget Planning
| What | Cost | Notes |
|---|---|---|
| Pre-flight test (Brief 3) | ~$0.75 | Cheapest brief, just to verify |
| Recording Brief 1 (Showstopper) x3 takes | ~$7.50 | Main demo, plan for retakes |
| Recording Brief 2 (Strategy) x2 takes | ~$3.50 | If recording multiple demos |
| Recording Brief 3 (Quick Win) x2 takes | ~$1.50 | For short social clips |
| **Total expected** | **~$13.25** | Leave headroom for surprises |

### Between Takes
- [ ] Run `aicib stop` between takes to avoid idle agent costs
- [ ] Delete the demo company folder and re-init for a clean take:
  ```bash
  rm -rf FreelancerPM && aicib init --name "FreelancerPM"
  ```
- [ ] Check cumulative cost with `aicib cost` before each new take

---

## 4. Recording Software

### Option A: Screen Studio (macOS -- Recommended)
- Best for polished demos with automatic zoom effects
- Outputs MP4 with smooth cursor animations
- Can add background blur and padding automatically
- **Settings:** Record at 2x resolution, export at 1080p, 30fps

### Option B: OBS Studio (Free, All Platforms)
- Best for raw screen capture with maximum control
- **Settings:**
  - Source: Window Capture (select terminal window only)
  - Output resolution: 1920x1080
  - Frame rate: 30fps
  - Encoder: x264, CRF 18 (high quality)
  - Format: MKV (remux to MP4 after recording -- avoids corruption if OBS crashes)
- [ ] Do a 10-second test recording and play it back before the real take

### Option C: asciinema (Terminal-Only, Lightweight)
- Records terminal sessions as text (tiny file size, perfect playback)
- Can be embedded on websites or converted to GIF/MP4
- **Install:** `brew install asciinema`
- **Record:** `asciinema rec demo.cast`
- **Playback:** `asciinema play demo.cast`
- **Convert to GIF:** Use `agg` (asciinema gif generator):
  ```bash
  brew install agg
  agg demo.cast demo.gif --font-size 16 --theme monokai
  ```
- Best for README GIFs and lightweight sharing

### Recording Tips (All Tools)
- [ ] Record the full session uncut -- edit later
- [ ] Keep a notepad open (off-screen) with the brief text ready to paste
- [ ] Practice typing the commands 2-3 times before recording (muscle memory)
- [ ] If you make a typo, keep going -- you can cut it in editing
- [ ] Record audio (voiceover) separately for better quality

---

## 5. Recovery: What to Do If Something Fails

### Agent fails to start
1. Run `aicib stop` to clean up
2. Wait 5 seconds
3. Run `aicib start` again
4. If it fails again, delete and re-init:
   ```bash
   rm -rf FreelancerPM && aicib init --name "FreelancerPM" && aicib start
   ```

### Brief hangs or produces no output
1. Wait 30 seconds -- API might be slow
2. If still no output, press Ctrl+C to cancel
3. Run `aicib status` to check agent states
4. Run `aicib stop && aicib start` to reset
5. Try the brief again

### Output looks wrong or garbled
1. Check terminal window size (`tput cols` / `tput lines`)
2. Resize terminal to 120x35 or larger
3. Run `clear` and try again

### Cost unexpectedly high
1. Run `aicib cost` to check current spend
2. Run `aicib stop` immediately to halt all agent activity
3. Review what happened before continuing
4. If close to daily limit, stop and resume another day

### API rate limiting or errors
1. Wait 60 seconds and retry
2. If persistent, check Claude status page for outages
3. Try again during off-peak hours (early morning or late evening US time)

### "Nuclear option" -- full reset
```bash
aicib stop
rm -rf FreelancerPM
aicib init --name "FreelancerPM"
aicib start
# Paste brief again
```

---

## 6. Post-Recording

### Editing
- [ ] Trim dead time at the beginning and end
- [ ] Speed up the init + start sequence to 1.5x (Scenes 1-2)
- [ ] Keep the brief streaming at 1x speed (Scene 3 -- this is the magic)
- [ ] Speed up agent communication to 1.25x (Scene 4)
- [ ] Keep status + CEO report at 1x (Scenes 6-7)
- [ ] Add a 3-second fade-in at the start and 3-second fade-out at the end
- [ ] Target final length: **90-120 seconds** (under 2 minutes is critical for social media)

### Voiceover
- [ ] Record in a quiet room with no echo
- [ ] Use a USB microphone or good headset (not laptop mic)
- [ ] Speak slowly and clearly -- the terminal is doing the heavy lifting visually
- [ ] Lay the voiceover track over the terminal footage in your video editor
- [ ] Add subtle background music (lo-fi, ambient) at 10-15% volume

### Export Formats
| Format | Use Case | Settings |
|---|---|---|
| MP4 (1080p, 30fps) | YouTube, Twitter/X, LinkedIn | H.264, high quality |
| MP4 (720p, 30fps) | Compressed sharing, email | H.264, medium quality |
| GIF (800px wide) | GitHub README, docs, blog posts | 15fps, 256 colors, looped |
| WebM | Website embed | VP9, high quality, smaller file size |
| asciinema .cast | Interactive terminal embed | Native format, smallest file |

### Where to Host
| Platform | Why |
|---|---|
| YouTube (unlisted or public) | Easy embedding, analytics, no file size limit |
| GitHub README | First thing people see on the repo -- use GIF or asciinema embed |
| Twitter/X | Short MP4, autoplay. Great for viral reach. Under 2:20 |
| LinkedIn | Same MP4 as Twitter. Longer text post explaining the vision |
| Product Hunt | Upload as part of the product launch page |
| Loom | Quick sharing with investors, no editing needed |

### Converting to GIF for README
```bash
# Using ffmpeg (if you have an MP4)
ffmpeg -i demo.mp4 -vf "fps=12,scale=800:-1:flags=lanczos" -c:v gif demo.gif

# Using agg (if you have an asciinema recording)
agg demo.cast demo.gif --font-size 14 --theme monokai --speed 1.5

# Using gifski (highest quality GIFs, install with: brew install gifski)
ffmpeg -i demo.mp4 -vf "fps=12,scale=800:-1" -f image2pipe -vcodec ppm - | gifski -o demo.gif --fps 12 --width 800
```

**GIF file size target:** Under 5MB for GitHub README (GitHub displays GIFs up to 10MB but large files load slowly).

---

## 7. Quick Reference: Recording Day Sequence

```
1.  Turn on Do Not Disturb / Focus mode
2.  Open terminal, set font size 16+, clean prompt
3.  Resize to 120x35
4.  Run pre-flight test with Brief 3
5.  Confirm everything works, check cost
6.  Delete test folder, clear terminal
7.  Start recording software
8.  Record 10-second test, play back, verify quality
9.  Start real recording
10. Run: aicib init --name "FreelancerPM"
11. Run: aicib start
12. Paste Brief 1 (Showstopper)
13. Wait for completion
14. Run: aicib status
15. Stop recording
16. Review footage
17. If good: move to editing
18. If not: aicib stop, delete folder, repeat from step 9
19. Export final video
20. Upload to YouTube + create README GIF
```

---

## 8. Final Sanity Check

Before you hit "record" for real, ask yourself:

- [ ] Is the terminal clean and readable?
- [ ] Do I have the brief text ready to paste?
- [ ] Is the cost limit set?
- [ ] Is Do Not Disturb on?
- [ ] Did the pre-flight test pass?
- [ ] Is my recording software configured and tested?
- [ ] Do I know what to do if something fails?

If all boxes are checked: **hit record.**
