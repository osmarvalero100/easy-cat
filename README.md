# 📖 Easy Cat

**Easy Cat** (El *Cat* es de Catálogo) es una plataforma full-stack para la creación, personalización, gestión y publicación de catálogos interactivos de alta gama inspirados en el diseño editorial de revistas de lujo (formato A4).

Especialmente diseñado para artesanos, creadores de velas aromáticas, productos botánicos y marcas de temporada con soporte para múltiples emprendimientos y conexión con Inteligencia Artificial (*Bring Your Own Key*).

Construido con **Next.js 16 (Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS** y **MySQL 8.0**.

---

## ✨ Características Principales

### 1. 🏢 Gestión Multi-Emprendimiento (Proyectos)
- Administra múltiples marcas o negocios desde una sola cuenta.
- Configura datos generales por proyecto: nombre comercial, logotipo oficial, moneda predeterminada y datos de contacto de cabecera.
- Cada emprendimiento tiene sus propios catálogos y colecciones independientes.

### 2. 🎨 Parametrización Editorial y Temporadas
- **Colecciones predefinidas con un clic:**
  - 🎄 **Navidad & Fin de Año**: Tonos verde abeto, dorados festivos, especias cálidas y pino silvestre.
  - ❤️ **Amor y Amistad / San Valentín**: Borgoña profundo, rosa empolvado y notas florales.
  - 🌸 **Día de las Madres**: Lavandas suaves, salvia y alabastro.
  - 👶 **Baby Shower**: Tonos pasteles tiernos y notas dulces reconfortantes.
  - 🎓 **Graduaciones & Triunfos**: Azul real, dorados y estética solemne.
  - 🕊️ **Eventos Religiosos**: Blanco puro, dorados y notas místicas de mirra e incienso.
  - 🍂 **Otoño & Cosecha**: Terracotas, ámbar y aromas especiados.
  - 🌿 **Editorial & Minimalista**: Estética nórdica limpia como revista de diseño contemporáneo.
  - ✨ **Personalizado**: Paleta de colores libre para tu propia identidad visual.
- Selectores de color en vivo, tipografías serif editoriales y portadas artísticas.

### 3. 📐 Indicador Visual de Dimensiones & Ficha Técnica
- **Silueta gráfica interactiva:** Dibuja a escala proporcional la forma con su mecha y llama.
- **Líneas de cota vectoriales:** Muestra claramente el **Alto (↕ cm)** y el **Ancho / Diámetro (↔ cm)**.
- Muestrario de colores (swatches), etiquetas de aromas y lista detallada de "Qué incluye" el producto o empaque.

### 4. 🤖 Asistente de Redacción e Inteligencia Artificial (BYOK)
- Modelo **Bring Your Own Key**: Conecta tu propia suscripción o clave API (OpenAI GPT-4o, Google Gemini, Anthropic Claude u OpenRouter).
- **Generación sensorial:** Redacta descripciones comerciales evocadoras con longitud calibrada para la cuadrícula editorial A4 sin romper el diseño.
- **Extractor masivo:** Convierte listas desordenadas de WhatsApp o notas en productos estructurados.
- **Manifiesto editorial:** Crea cartas del artesano y textos de bienvenida para portadas.

### 5. 📄 Exportación a PDF e Impresión A4
- Descarga directa en `.pdf` listo para enviar por WhatsApp o correo.
- Modo Imprenta (`window.print()`): Hojas con corte A4 exacto (`210mm x 297mm`) y tipografía vectorial nítida.

### 6. 🌐 Enlace Compartible para Clientes (/c/[slug])
- Genera una URL pública para cada catálogo con metadatos dinámicos OpenGraph.
- Alternancia de visualización: **Modo Revista Editorial (A4)** y **Modo Cuadrícula Móvil**.
- Botón directo de pedido por **WhatsApp** con mensaje pre-cargado.

### 7. 🗄️ Persistencia MySQL
- Base de datos relacional aislada: **`easy_cat`**.
- Tablas automáticas con eliminación en cascada: `users`, `sessions`, `projects`, `catalogs`, `products`, `user_ai_settings`.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- npm

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env.local)
cp .env.example .env.local
```

### Configuración de Base de Datos (`.env.local`)

```env
DB_HOST=85.31.63.21
DB_PORT=3904
DB_NAME=easy_cat
DB_USER=root
DB_PASSWORD=tu_contraseña
NEXT_PUBLIC_APP_NAME="Easy Cat"
```

> **Nota:** La base de datos configurada para esta aplicación es exclusivamente **`easy_cat`**.

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abre en tu navegador:
- **Panel de Emprendimientos y Estudio:** [http://localhost:3000](http://localhost:3000)
- **Inicio de Sesión:** [http://localhost:3000/login](http://localhost:3000/login)

### Compilación para Producción

```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── layout.tsx                     # Layout raíz con fuentes Cormorant, Playfair e Inter
│   ├── globals.css                    # Estilos Tailwind y reglas CSS @media print A4
│   ├── page.tsx                       # Dashboard de proyectos + Estudio editorial
│   ├── login/page.tsx                 # Autenticación (Login y Registro)
│   ├── c/[slug]/page.tsx              # Vista pública del cliente conectada a MySQL
│   └── api/
│       ├── auth/                      # Endpoints: login, logout, me, register
│       ├── projects/                  # CRUD de emprendimientos y marcas
│       ├── catalogs/                  # CRUD de catálogos y duplicación
│       └── ai/                        # Configuración BYOK y generación con IA
├── components/
│   ├── projects/                      # Vista panel de control de emprendimientos
│   ├── editor/                        # Panel de edición, temas y formulario de producto
│   ├── preview/                       # Páginas A4: Portada, productos, cotas y contraportada
│   ├── shared/                        # Header navbar, modales de catálogo, proyecto, PDF y URL
│   └── ai/                            # Modal y herramientas del asistente de IA
├── lib/
│   ├── db.ts                          # Pool MySQL easy_cat, esquemas y repositorios
│   ├── auth.ts                        # Encriptación scrypt y manejo de sesiones
│   ├── pdfGenerator.ts                # Motor de exportación jsPDF y modo imprenta
│   └── storage.ts                     # Caché local y utilidades
└── types/
    └── catalog.ts                     # Definiciones de Proyecto, Catálogo, Producto e IA
```

---

## 📄 Licencia

Distribuido bajo licencia MIT. Desarrollado para artesanos y marcas de velas y productos de temporada.
