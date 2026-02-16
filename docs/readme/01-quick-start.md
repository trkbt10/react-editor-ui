## Usage

### Individual Component Imports

For optimal bundle size, import components directly:

```tsx
import { Button } from "react-editor-ui/Button";
import { Input } from "react-editor-ui/Input";
import { Select } from "react-editor-ui/Select";
```

### Theming

The library uses CSS custom properties for theming. Import the theme utilities:

```tsx
import { injectTheme, ThemeSelector } from "react-editor-ui/themes";

// Apply dark theme
injectTheme("dark");

// Or use the theme selector component
<ThemeSelector />
```

