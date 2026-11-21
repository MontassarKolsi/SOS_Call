import { PrismaService } from './prisma/prisma.service';
async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  await prisma.merchant.upsert({ where: { slug: 'demo-shop' }, update: { status: 'ACTIVE' }, create: { name: 'Demo Shop', slug: 'demo-shop', website: 'http://localhost:5175' } });
  console.log('Demo merchant ready: demo-shop');
  await prisma.$disconnect();
}
main().catch((error) => { console.error(error); process.exit(1); });
