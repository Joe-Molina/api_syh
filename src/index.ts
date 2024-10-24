import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const PORT = process.env.PORT ?? 3002;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/socios", async (_req, res) => {
  const data = await prisma.socios.findMany();

  const socios = data.map(s => {
    return Object.fromEntries(
      Object.entries(s).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
    )
  })

  res.json(socios)
})

app.get("/socio/:codigo", async (req, res) => {
  const data = await prisma.socios.findFirst({
    where: {
      codigo: req.params.codigo
    },
  });

  if (data) {

    const socio = {
      ...data,
      exonerado: data.exonerado?.toString(),
      sexo: data.sexo?.toString(),
    }

    const familiaresBd = await prisma.familiares.findMany({
      where: {
        codigo_socios: req.params.codigo
      }
    });

    const familiares = familiaresBd.map(s => {
      return Object.fromEntries(
        Object.entries(s).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
      )
    })

    res.json({ socio, familiares })
  }
})

app.get("/facturas/:codigo", async (req, res) => {

  const facturas = await prisma.facturas.findMany({
    where: {
      proveedor: req.params.codigo
    },
    select: {
      nombre: true,
      nombrecli: true,
      notas: true,
      tipodoc: true,
      proveedor: true,
      emisor: true,
      cantidad: true,
      montototal: true,
      fechadoc: true,
      estatusdoc: true,
      documento: true
    },
    orderBy: {
      fechadoc: 'desc' // 'desc' for descending order
    },
    take: 100
  });

  res.json({ facturas })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});