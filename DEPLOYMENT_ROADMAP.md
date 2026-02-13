# Deployment Roadmap: Digital Garden en Vercel

## Objetivo

Desplegar la app Next.js del Digital Garden en **Vercel** con el subdominio `garden.kikelopez.es`.

---

## 1. Preparar el repositorio en GitHub

- [ ] Crear un repositorio en GitHub (puede ser el mismo del portfolio o uno dedicado solo al `digital-garden/`)
- [ ] Subir el contenido de la carpeta `digital-garden/` al repositorio
- [ ] Asegurarse de que `.env.local` y `.vercel/` estan en `.gitignore` (ya lo estan)

### Archivos clave del proyecto

```
digital-garden/
├── app/
│   ├── layout.tsx          # Layout principal con Header
│   ├── page.tsx            # Listado de posts (homepage)
│   ├── globals.css         # Estilos globales
│   └── garden/[slug]/
│       └── page.tsx        # Detalle de cada post
├── components/
│   ├── Header.tsx          # Header compartido
│   └── FilterPanel.tsx     # Panel de filtros
├── lib/
│   └── notion.ts           # Conexion con Notion API
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 2. Crear proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesion con GitHub
2. Click en **"Add New Project"**
3. Importar el repositorio de GitHub
4. Configurar:
   - **Framework Preset:** Next.js (se detecta automaticamente)
   - **Root Directory:** `digital-garden` (si el repo incluye todo el portfolio, indicar la subcarpeta)
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)

---

## 3. Configurar variables de entorno en Vercel

En el dashboard del proyecto en Vercel, ir a **Settings > Environment Variables** y añadir:

| Variable | Valor | Entornos |
|---|---|---|
| `NOTION_TOKEN` | `secret_xxx...` (token de la integracion de Notion) | Production, Preview, Development |
| `NOTION_DATABASE_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID de la base de datos) | Production, Preview, Development |

### Donde obtener estos valores

- **NOTION_TOKEN:** En [notion.so/my-integrations](https://www.notion.so/my-integrations), crear o acceder a la integracion y copiar el "Internal Integration Secret"
- **NOTION_DATABASE_ID:** Abrir la base de datos en Notion > copiar el ID de la URL (la parte entre `/` y `?`)

---

## 4. Configurar el dominio personalizado

### 4.1 En Vercel

1. Ir a **Settings > Domains** en el proyecto
2. Añadir el dominio: `garden.kikelopez.es`
3. Vercel mostrara las instrucciones DNS necesarias

### 4.2 En Hostinger (donde esta el dominio kikelopez.es)

Añadir un registro DNS:

```
Tipo:    CNAME
Nombre:  garden
Destino: cname.vercel-dns.com
TTL:     Automatico
```

### 4.3 Verificacion

- Esperar a la propagacion DNS (puede tardar hasta 48h, normalmente minutos)
- Vercel configurara automaticamente el certificado SSL
- Verificar que `https://garden.kikelopez.es` carga correctamente

---

## 5. Verificar el despliegue

Checklist post-deploy:

- [ ] La pagina principal carga y muestra los posts de Notion
- [ ] Los filtros por tag funcionan
- [ ] El ordenamiento (newest/oldest) funciona
- [ ] Los posts pineados aparecen primero con su estilo naranja
- [ ] Hacer click en un post abre su pagina de detalle (`/garden/[slug]`)
- [ ] Los links externos se abren en nueva pestaña
- [ ] El header navega correctamente entre el portfolio (`kikelopez.es`) y el garden
- [ ] La pagina se actualiza automaticamente cada 60 segundos (ISR con `revalidate: 60`)
- [ ] El responsive funciona correctamente (mobile y desktop)

---

## 6. Flujo de actualizacion de contenido

Una vez desplegado, el flujo de trabajo es:

1. **Crear/editar contenido en Notion** (base de datos conectada)
2. **Esperar ~60 segundos** (ISR se encarga de refrescar el contenido)
3. **El contenido aparece automaticamente** en `garden.kikelopez.es`

No es necesario hacer redeploy para actualizar contenido gracias a ISR.

---

## 7. Consideraciones adicionales

### Rendimiento

- Las imagenes de Notion tienen URLs temporales que expiran. Considerar implementar `next/image` con un loader externo si se usan muchas imagenes.
- El cache de 60 segundos (`revalidate: 60`) es un buen balance entre frescura y rendimiento.

### Notion API

- La integracion de Notion debe tener acceso a la base de datos (compartir la DB con la integracion)
- La base de datos necesita las siguientes propiedades:
  - **Title** (title) - Titulo del post
  - **Slug** (rich_text) - URL slug del post
  - **Date** (date) - Fecha de publicacion
  - **Status** (status) - Debe ser "Published" para que aparezca
  - **Tags** (multi_select) - Tags/categorias
  - **Select** (select) - Valor "Pin" para pinear un post
  - **url** (url) - URL externa opcional

### Header/Navegacion

El Header usa URLs absolutas para navegar al portfolio principal:
- Home → `https://kikelopez.es/`
- Work → `https://kikelopez.es/work.html`
- About → `https://kikelopez.es/about.html`
- Contact → `https://kikelopez.es/contact.html`
- Garden → `/` (ruta interna del digital garden)
