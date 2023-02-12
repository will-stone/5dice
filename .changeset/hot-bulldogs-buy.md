---
'5dice': patch
---

Rolling state is no longer saved to file. It was redundant as the file would
only be saved if `isRolling` was false, so the saved state would always be
false.
