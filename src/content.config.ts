import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada pieza de contenido es un archivo .md en src/content/<colección>/.
// El nombre del archivo es el slug de la URL. Los campos se validan al compilar.

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    resumen: z.string(),
    // Ruta bajo /public, p. ej. /assets/img/noticias/mi-noticia.webp
    imagen: z.string().optional(),
  }),
});

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventos' }),
  schema: z.object({
    titulo: z.string(),
    // Sin fecha se muestra como "Pronto".
    fecha: z.coerce.date().optional(),
    resumen: z.string(),
  }),
});

const documentos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documentos' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    categoria: z.string(),
    tipo: z.string().default('PDF'),
    // Ruta bajo /public, p. ej. /docs/estatutos.pdf. Sin url: "Documento pendiente de carga".
    url: z.string().optional(),
    fecha: z.coerce.date(),
  }),
});

export const collections = { noticias, eventos, documentos };
