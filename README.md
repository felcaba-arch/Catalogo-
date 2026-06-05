# Catálogo Claro — Stock en Vivo

Catálogo web de teléfonos, accesorios y planes Claro Paraguay.
Solo muestra productos con stock disponible. Se actualiza automáticamente desde Google Sheets.

## URL pública
https://felcaba-arch.github.io/Catalogo-

## Cómo actualizar productos
1. Abrí el Google Sheets: https://docs.google.com/spreadsheets/d/1i4hkB1j5PDni4GRuoyst7VsN01cCwWqyYalvGrdNZYM
2. Modificá STOCK o PRECIO de cualquier producto
3. El catálogo se actualiza solo en máximo 5 minutos

## Columnas del Sheets
| Columna | Descripción |
|---------|-------------|
| PRODUCTO | Nombre del producto |
| CATEGORIA | Teléfonos / Accesorios / Planes |
| PRECIO | Solo números, en guaraníes |
| STOCK | 0 = no aparece en el catálogo |
| IMAGEN | URL de la imagen (opcional) |

## Archivos
- `index.html` — estructura de la página
- `styles.css` — diseño visual
- `app.js` — lógica y conexión con Sheets
