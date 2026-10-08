"""Compare screenshots after tests/gameplay.py runs against both builds."""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

results = []
for baseline in sorted(Path('artifacts/baseline').glob('*.png')):
    migrated = Path('artifacts/migrated') / baseline.name
    a, b = Image.open(baseline).convert('RGB'), Image.open(migrated).convert('RGB')
    assert a.size == b.size, baseline.name
    difference = ImageChops.difference(a, b)
    means = ImageStat.Stat(difference).mean
    # Chromium backdrop blur can differ by subpixel quantization after CSS bundling.
    # At most 0.1 of 255 mean error per channel; briefing and mobile must be exact.
    assert max(means) <= 0.1, (baseline.name, means)
    if baseline.name in ('opening.png', 'mobile.png'):
        assert difference.getbbox() is None, baseline.name
    results.append({'image': baseline.name, 'identical': difference.getbbox() is None, 'mean_channel_error': means})
Path('artifacts/migrated/visual-comparison.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results, indent=2))
