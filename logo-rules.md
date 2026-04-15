# BL Logo — Design Rules & Saved Variants

## Final Logo (Backup / Active Version)

L vertical at x=70, from y=4 to y=70. Diagonal from (70,70) to (48,96). Base from (48,96) to (92,96).

```svg
<svg viewBox="-2 -2 100 114" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- B: closed geometric path, all endpoints touching -->
  <path d="M10,6 L48,6 L58,16 L58,38 L48,48 L58,58 L58,84 L48,96 L10,96 Z" stroke="white" stroke-width="2.5" fill="none" stroke-linejoin="miter" stroke-linecap="butt"/>
  <!-- B middle bar -->
  <line x1="10" y1="48" x2="48" y2="48" stroke="white" stroke-width="2.5"/>
  <!-- L: vertical + diagonal + balanced base -->
  <polyline points="70,4 70,70 48,96 92,96" stroke="white" stroke-width="2.5" fill="none" stroke-linejoin="miter" stroke-linecap="butt"/>
</svg>
```

## Saved Variant: D4

L vertical at x=78, from y=6 to y=60. Diagonal from (78,60) to (48,96). Base from (48,96) to (108,96).

```svg
<svg viewBox="-2 -2 114 112" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,6 L48,6 L58,16 L58,38 L48,48 L58,58 L58,84 L48,96 L10,96 Z" stroke="white" stroke-width="2.5" fill="none" stroke-linejoin="miter" stroke-linecap="butt"/>
  <line x1="10" y1="48" x2="48" y2="48" stroke="white" stroke-width="2.5"/>
  <polyline points="78,6 78,60 48,96 108,96" stroke="white" stroke-width="2.5" fill="none" stroke-linejoin="miter" stroke-linecap="butt"/>
</svg>
```

---

## Design Rules (for future changes)

### B Shape

- **Path**: `M10,6 L48,6 L58,16 L58,38 L48,48 L58,58 L58,84 L48,96 L10,96 Z`
- **Middle bar**: horizontal line from (10,48) to (48,48) — sits exactly at the bump vertex
- All straight lines, geometric/blocky style
- Closed path (Z) with `stroke-linejoin="miter"` so all endpoints touch with sharp corners
- No curves, no rounded corners

### L Shape (3 lines: vertical + diagonal + base)

1. **Vertical line**: separate from B, to the right. Goes straight down from top.
2. **Diagonal line**:
   - MUST follow the same geometric line as B's bottom diagonal (from (58,84) to (48,96))
   - Line equation: `y = -1.2x + 153.6`
   - The diagonal overlaps/extends B's bottom diagonal
   - Starts where the vertical meets this line
   - Ends at (48,96) — B's bottom-right corner (where B's diagonal meets B's base at y=96)
3. **Base line**: horizontal going right from the diagonal endpoint (48,96)
   - **Must be balanced**: equal length left AND right of the vertical line's x position
   - Formula: left_distance = vertical_x - 48. Base extends to: vertical_x + left_distance

### Calculating L for any vertical x position

Given vertical at x = V:

- Vertical break point y = -1.2 \* V + 153.6
- Vertical: (V, top_y) → (V, break_y)
- Diagonal: (V, break_y) → (48, 96)
- Base left distance: V - 48
- Base end: V + (V - 48) = 2V - 48
- Base: (48, 96) → (2V - 48, 96)

### Examples

| Vertical x | Break y | Vertical        | Diagonal        | Base end x | Base total |
| ---------- | ------- | --------------- | --------------- | ---------- | ---------- |
| 70         | 69.6→70 | (70,4)→(70,70)  | (70,70)→(48,96) | 92         | 44px       |
| 75         | 63.6→64 | (75,10)→(75,64) | (75,64)→(48,96) | 102        | 54px       |
| 78         | 60      | (78,6)→(78,60)  | (78,60)→(48,96) | 108        | 60px       |
| 80         | 57.6→58 | (80,6)→(80,58)  | (80,58)→(48,96) | 112        | 64px       |

### Style

- Stroke width: 2.5 (all lines)
- Stroke color: white (on dark backgrounds) or match theme
- `stroke-linejoin="miter"` — sharp corners
- `stroke-linecap="butt"` — clean line ends
- No fill
