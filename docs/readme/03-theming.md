## Theming

### CSS Custom Properties

All components use CSS custom properties (CSS variables) with the `--rei-` prefix for consistent theming.

```css
:root {
  --rei-color-bg: #1e1e1e;
  --rei-color-text: #ffffff;
  --rei-color-primary: #0066ff;
  --rei-radius-sm: 4px;
  --rei-space-sm: 8px;
}
```

### Built-in Themes

```tsx
import { injectTheme } from "react-editor-ui/themes";

// Available themes: "light" | "dark"
injectTheme("dark");
```

### Custom Theme

Create a custom theme by overriding CSS variables:

```css
.my-theme {
  --rei-color-bg: #2d2d2d;
  --rei-color-primary: #ff6b00;
}
```

