import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';

const CustomPreset = definePreset(Material, {
  primitive: {
    // Custom color primitives based on application variables
    autoBlue: {
      50: '#f0f9fc',
      100: '#e0f3f9',
      200: '#c1e7f3',
      300: '#92d7eb',
      400: '#4FC1E0', // Main blue from variables
      500: '#3DAFCC',
      600: '#3D95AD', // darker-blue from variables
      700: '#2D7180',
      800: '#225361', // dark-blue from variables
      900: '#184451', // darkest-blue from variables
      950: '#0d2a31',
    },
    autoGreen: {
      // Accessible green for success states
      50: '#ecfdf3',
      100: '#d1fadd',
      200: '#a7f3bd',
      300: '#6ee7a8',
      400: '#34d399',
      500: '#22c386',
      600: '#16a06b',
      700: '#15845c',
      800: '#16624a',
      900: '#0f3d31',
      950: '#0a2b23',
    },
    autoGray: {
      // Light neutral ramp for readable inputs/surfaces
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1f2937',
      900: '#111827',
      950: '#0b1220',
    },
  },
  semantic: {
    // Primary color scheme using the auto blue
    primary: {
      50: '{autoBlue.50}',
      100: '{autoBlue.100}',
      200: '{autoBlue.200}',
      300: '{autoBlue.300}',
      400: '{autoBlue.400}',
      500: '{autoBlue.500}',
      600: '{autoBlue.600}',
      700: '{autoBlue.700}',
      800: '{autoBlue.800}',
      900: '{autoBlue.900}',
      950: '{autoBlue.950}',
    },
    colorScheme: {
      light: {
        // Primary color configuration for light mode
        primary: {
          color: '{autoBlue.400}',
          inverseColor: '#ffffff',
          hoverColor: '{autoBlue.600}',
          activeColor: '{autoBlue.700}',
        },
        // Base text colors for overlays/menus
        text: {
          color: '{autoGray.900}',
          mutedColor: '{autoGray.600}',
          hoverColor: '{autoGray.900}',
        },
        // Overlay surfaces (dropdowns, dialogs, etc.)
        overlay: {
          background: '#ffffff',
          borderColor: '{autoGray.200}',
          color: '{autoGray.900}',
        },
        // Highlight colors using primary blue
        highlight: {
          background: '#eef6fb',
          focusBackground: '#d9ebf5',
          color: '{autoBlue.700}',
          focusColor: '{autoBlue.800}',
        },
        // Surface colors using grays and whites
        surface: {
          0: '#ffffff',
          50: '{autoGray.50}',
          100: '{autoGray.100}',
          200: '{autoGray.200}',
          300: '{autoGray.300}',
          400: '{autoGray.400}',
          500: '{autoGray.500}',
          600: '{autoGray.600}',
          700: '{autoGray.700}',
          800: '{autoGray.800}',
          900: '{autoGray.900}',
          950: '{autoGray.950}',
        },
        // Form field configuration
        formField: {
          background: '#ffffff',
          disabledBackground: '{autoGray.100}',
          filledBackground: '#ffffff',
          filledHoverBackground: '{autoGray.50}',
          filledFocusBackground: '#ffffff',
          borderColor: '{autoGray.300}',
          hoverBorderColor: '{autoBlue.400}',
          focusBorderColor: '{autoBlue.500}',
          invalidBorderColor: '#d14343',
          color: '{autoGray.900}',
          disabledColor: '{autoGray.500}',
          placeholderColor: '{autoGray.500}',
          invalidPlaceholderColor: '#d14343',
        },
        // Success state using green
        success: {
          background: '{autoGreen.50}',
          borderColor: '{autoGreen.400}',
          color: '{autoGreen.700}',
          hoverBackground: '{autoGreen.100}',
          activeBackground: '{autoGreen.200}',
        },
        // Error/danger state using error red
        danger: {
          background: '#fee2e2',
          borderColor: '#ff0000',
          color: '#dc2626',
          hoverBackground: '#fecaca',
          activeBackground: '#fca5a5',
        },
      },
      dark: {
        // Primary color configuration for dark mode
        primary: {
          color: '{autoBlue.400}',
          inverseColor: '{autoBlue.950}',
          hoverColor: '{autoBlue.300}',
          activeColor: '{autoBlue.200}',
        },
        text: {
          color: '{autoGray.50}',
          mutedColor: '{autoGray.300}',
          hoverColor: '{autoGray.50}',
        },
        overlay: {
          background: '#0f1418',
          borderColor: '{autoGray.800}',
          color: '{autoGray.50}',
        },
        // Highlight colors for dark mode
        highlight: {
          background: 'rgba(79, 193, 224, 0.16)',
          focusBackground: 'rgba(79, 193, 224, 0.24)',
          color: 'rgba(79, 193, 224, 0.87)',
          focusColor: 'rgba(79, 193, 224, 0.87)',
        },
        // Surface colors for dark mode
        surface: {
          0: '#ffffff',
          50: '{autoGray.950}',
          100: '{autoGray.900}',
          200: '{autoGray.800}',
          300: '{autoGray.700}',
          400: '{autoGray.600}',
          500: '{autoGray.500}',
          600: '{autoGray.400}',
          700: '{autoGray.300}',
          800: '{autoGray.200}',
          900: '{autoGray.100}',
          950: '{autoGray.50}',
        },
        // Form field configuration for dark mode
        formField: {
          // Keep dark scheme but avoid black inputs; align with light accessibility
          background: '#ffffff',
          disabledBackground: '{autoGray.100}',
          filledBackground: '#ffffff',
          filledHoverBackground: '{autoGray.50}',
          filledFocusBackground: '#ffffff',
          borderColor: '{autoGray.300}',
          hoverBorderColor: '{autoBlue.400}',
          focusBorderColor: '{autoBlue.500}',
          invalidBorderColor: '#ff6b6b',
          color: '{autoGray.900}',
          disabledColor: '{autoGray.500}',
          placeholderColor: '{autoGray.500}',
          invalidPlaceholderColor: '#ff6b6b',
        },
        // Success state for dark mode
        success: {
          background: 'rgba(28, 210, 134, 0.16)',
          borderColor: '{autoGreen.400}',
          color: '{autoGreen.300}',
          hoverBackground: 'rgba(28, 210, 134, 0.24)',
          activeBackground: 'rgba(28, 210, 134, 0.32)',
        },
        // Error/danger state for dark mode
        danger: {
          background: 'rgba(255, 0, 0, 0.16)',
          borderColor: '#ff6b6b',
          color: '#fca5a5',
          hoverBackground: 'rgba(255, 0, 0, 0.24)',
          activeBackground: 'rgba(255, 0, 0, 0.32)',
        },
      },
    },
  },
  components: {
    button: {
      // Button tokens reference semantic colors automatically
      // ColorScheme variations are handled by the semantic layer
      root: {
        borderRadius: '6px',
        paddingX: '1rem',
        paddingY: '0.5rem',
      },
    },
    inputtext: {
      // InputText tokens reference semantic colors automatically
      root: {
        borderRadius: '6px',
        paddingX: '0.75rem',
        paddingY: '0.5rem',
      },
    },
    dropdown: {
      content: {
        background: '#ffffff',
        color: '{autoGray.900}',
        borderColor: '{autoGray.200}',
      },
      option: {
        color: '{autoGray.900}',
        focusBackground: '{autoGray.50}',
      },
    },
    select: {
      dropdown: {
        color: '{autoGray.900}',
      },

      option: {
        color: '{autoGray.900}',
        focusColor: '{autoGray.900}',
      },
    },
    multiselect: {
      option: {
        color: '{autoGray.900}',
        focusBackground: '{autoGray.50}',
      },
    },
  },
});

export default CustomPreset;
