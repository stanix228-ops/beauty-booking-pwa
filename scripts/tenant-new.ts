import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function generateNewTenant(slugInput?: string, nameInput?: string) {
  const slug = (slugInput || 'velvet-nails').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const name = nameInput || 'Velvet Nails Studio';

  const tenantDir = path.join(rootDir, 'tenants', slug);
  if (fs.existsSync(tenantDir)) {
    console.error(`Error: Directory already exists for tenant "${slug}" at ${tenantDir}`);
    process.exit(1);
  }

  fs.mkdirSync(tenantDir, { recursive: true });
  fs.mkdirSync(path.join(tenantDir, 'assets'), { recursive: true });

  const tenantId = crypto.randomUUID();
  const catManicureId = crypto.randomUUID();
  const catPedicureId = crypto.randomUUID();
  const catDesignId = crypto.randomUUID();

  const desk1Id = crypto.randomUUID();
  const desk2Id = crypto.randomUUID();
  const pedChairId = crypto.randomUUID();

  const serv1Id = crypto.randomUUID();
  const serv2Id = crypto.randomUUID();
  const serv3Id = crypto.randomUUID();

  const optRemovalId = crypto.randomUUID();
  const optStrengthenId = crypto.randomUUID();
  const optFrenchId = crypto.randomUUID();

  const master1Id = crypto.randomUUID();
  const master2Id = crypto.randomUUID();

  const defaultSchedule = [
    { dayOfWeek: 0, startTime: '10:00', endTime: '20:00', isDayOff: false },
    { dayOfWeek: 1, startTime: '10:00', endTime: '21:00', isDayOff: false },
    { dayOfWeek: 2, startTime: '10:00', endTime: '21:00', isDayOff: false },
    { dayOfWeek: 3, startTime: '10:00', endTime: '21:00', isDayOff: false },
    { dayOfWeek: 4, startTime: '10:00', endTime: '21:00', isDayOff: false },
    { dayOfWeek: 5, startTime: '10:00', endTime: '21:00', isDayOff: false },
    { dayOfWeek: 6, startTime: '10:00', endTime: '20:00', isDayOff: false },
  ];

  const businessConfig = {
    id: tenantId,
    slug,
    name,
    tagline: 'Искусство совершенного маникюра и забота о ваших руках',
    phone: '+7 (999) 000-00-00',
    address: 'ул. Арбат, 25',
    city: 'Москва',
    timezone: 'Europe/Moscow',
    currency: 'RUB',
    minBookingNoticeMin: 60,
    maxBookingHorizonDays: 30,
    cancellationDeadlineHours: 4,
    instructions: 'Пожалуйста, приходите за 5 минут до назначенного времени. Если у вас есть аллергия или особенности ногтевой пластины, предупредите мастера.',
    theme: {
      accentColor: '#D97706',
      bgColor: '#0F172A',
      cardBgColor: '#1E293B',
      textColor: '#F8FAFC',
      mutedColor: '#94A3B8',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Inter, sans-serif',
    },
    businessHours: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 1, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 2, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 3, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 4, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 5, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00', isClosed: false },
    ],
    workplaces: [
      { id: desk1Id, name: 'Стол маникюра №1', type: 'MANICURE_DESK', isActive: true },
      { id: desk2Id, name: 'Стол маникюра №2', type: 'MANICURE_DESK', isActive: true },
      { id: pedChairId, name: 'Педикюрное кресло Comfort', type: 'PEDICURE_CHAIR', isActive: true },
    ],
    categories: [
      { id: catManicureId, name: 'Маникюр', displayOrder: 1, isActive: true },
      { id: catPedicureId, name: 'Педикюр', displayOrder: 2, isActive: true },
      { id: catDesignId, name: 'Дизайн & Укрепление', displayOrder: 3, isActive: true },
    ],
    services: [
      {
        id: serv1Id,
        categoryId: catManicureId,
        name: 'Комбинированный маникюр + гель-лак',
        description: 'Снятие, аппаратная обработка кутикулы, выравнивание базой, однотонное покрытие гель-лаком премиум-класса.',
        price: 2800,
        durationMin: 90,
        bufferAfterMin: 15,
        requiredWorkplaceType: 'MANICURE_DESK',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: serv2Id,
        categoryId: catManicureId,
        name: 'Пилочный атравматичный маникюр',
        description: 'Безопасная обработка без режущих инструментов и фрез. Идеально для тонкой чувствительной кожи.',
        price: 2300,
        durationMin: 60,
        bufferAfterMin: 15,
        requiredWorkplaceType: 'MANICURE_DESK',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: serv3Id,
        categoryId: catPedicureId,
        name: 'Smart-педикюр эстетический с покрытием',
        description: 'Аппаратная обработка стопы smart-дисками, пальчиков и стойкое покрытие гель-лаком.',
        price: 3600,
        durationMin: 105,
        bufferAfterMin: 15,
        requiredWorkplaceType: 'PEDICURE_CHAIR',
        displayOrder: 3,
        isActive: true,
      },
    ],
    options: [
      {
        id: optRemovalId,
        name: 'Снятие чужого покрытия',
        description: 'Бережное снятие старого покрытия без повреждения натурального ногтя',
        price: 400,
        durationMin: 20,
        bufferAfterMin: 0,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: optStrengthenId,
        name: 'Укрепление гелем / акрилом',
        description: 'Армирование тонких и ломких ногтей твердым моделирующим гелем',
        price: 600,
        durationMin: 20,
        bufferAfterMin: 0,
        displayOrder: 2,
        isActive: true,
      },
      {
        id: optFrenchId,
        name: 'Френч / Лунный дизайн (все ногти)',
        description: 'Идеальная улыбка классического или цветного френча',
        price: 700,
        durationMin: 30,
        bufferAfterMin: 0,
        displayOrder: 3,
        isActive: true,
      },
    ],
    masters: [
      {
        id: master1Id,
        name: 'Анна Воронова',
        title: 'Топ-мастер ногтевого сервиса',
        bio: 'Опыт работы 6 лет. Эксперт по чистому комбинированному маникюру и стойкому покрытию под кутикулу.',
        rating: 4.98,
        reviewsCount: 142,
        serviceIds: [serv1Id, serv2Id, serv3Id],
        schedule: defaultSchedule,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: master2Id,
        name: 'София Лебедева',
        title: 'Стилист ногтевого сервиса',
        bio: 'Специалист по скоростному эстетическому маникюру и френч-дизайнам.',
        rating: 4.95,
        reviewsCount: 88,
        serviceIds: [serv1Id, serv2Id],
        schedule: defaultSchedule,
        displayOrder: 2,
        isActive: true,
      },
    ],
    assets: {
      logo: '',
      hero: '',
      gallery: [],
    },
  };

  const targetFile = path.join(tenantDir, 'business.json');
  fs.writeFileSync(targetFile, JSON.stringify(businessConfig, null, 2), 'utf-8');

  console.log(`\n🎉 New studio template created successfully!`);
  console.log(`📁 Location: ${tenantDir}`);
  console.log(`📄 Config: ${targetFile}`);
  console.log(`Next step: edit business.json and run: npm run tenant:validate ${slug}\n`);
}

const args = process.argv.slice(2);
generateNewTenant(args[0], args[1]);
