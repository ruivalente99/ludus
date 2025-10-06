#!/bin/bash

echo "🎮 Testing Ludus Extension CSS Architecture"
echo "============================================"

# Check if required CSS files exist
echo "✅ Checking CSS files in out/styles/"
find out/styles/ -name "*.css" | wc -l
echo "Expected: 15 CSS files"

echo ""
echo "✅ Checking template files"
find out/templates/ -name "*.html" | grep -v "_old" | wc -l
echo "Expected: 17+ HTML template files"

echo ""
echo "✅ Checking for inline styles in templates (should be 0)"
grep -r "<style" out/templates/ --exclude="*_old.html" | wc -l
echo "Expected: 0 (all styles moved to CSS files)"

echo ""
echo "✅ Checking for gameCSS template variables"
grep -r "{{gameCSS:" out/templates/ --exclude="*_old.html" | wc -l
echo "Expected: 15+ template files with gameCSS variables"

echo ""
echo "✅ Sample of CSS files:"
ls -la out/styles/*.css | head -5

echo ""
echo "🎉 CSS Architecture Test Complete!"