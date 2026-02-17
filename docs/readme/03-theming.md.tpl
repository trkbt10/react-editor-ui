## Theming

All components use CSS custom properties (CSS variables) with the `--rei-` prefix for consistent theming.

### Built-in Themes

```tsx
import { injectTheme } from "react-editor-ui/themes";

// Available themes: "light" | "dark" | "high-contrast-light"
injectTheme("dark");
```

### Custom Theme

Create a custom theme by overriding CSS variables:

```css
.my-theme {
  --rei-color-surface: #2d2d2d;
  --rei-color-primary: #ff6b00;
}
```

Or use `injectTheme` with custom tokens:

```tsx
import { injectTheme } from "react-editor-ui/themes";

injectTheme({
  "color-primary": "#ff6b00",
  "color-surface": "#2d2d2d",
});
```

## Token Reference

<!-- AUTO:TOKENS -->
<!-- /AUTO:TOKENS -->

