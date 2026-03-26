import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Hash password for both users
  const passwordHash = await bcrypt.hash("changeme", 12);

  // Create GABBAI user
  const gabbaiUser = await prisma.user.upsert({
    where: { email: "gabbai@shul.local" },
    update: {},
    create: {
      email: "gabbai@shul.local",
      passwordHash,
      role: "GABBAI",
    },
  });

  // Create MEMBER user
  const memberUser = await prisma.user.upsert({
    where: { email: "member@shul.local" },
    update: {},
    create: {
      email: "member@shul.local",
      passwordHash,
      role: "MEMBER",
    },
  });

  console.log("Created users:", gabbaiUser.email, memberUser.email);

  // Sample members with Hebrew names
  const membersData = [
    {
      firstName: "Reuven",
      lastName: "Cohen",
      hebrewName: "ראובן בן יעקב",
      hebrewMotherName: "ראובן בן לאה",
      email: "reuven.cohen@example.com",
      phone: "7185551001",
      address: "123 Eastern Pkwy, Brooklyn, NY 11213",
      isActive: true,
      memberSince: new Date("2015-09-01"),
      notes: "Baal Tokea on Rosh Hashana",
    },
    {
      firstName: "Shimon",
      lastName: "Goldberg",
      hebrewName: "שמעון בן אברהם",
      hebrewMotherName: "שמעון בן מרים",
      email: "shimon.goldberg@example.com",
      phone: "7185551002",
      address: "456 Crown St, Brooklyn, NY 11225",
      isActive: true,
      memberSince: new Date("2018-03-15"),
      notes: null,
    },
    {
      firstName: "Levi",
      lastName: "Schwartz",
      hebrewName: "לוי בן משה",
      hebrewMotherName: "לוי בן רחל",
      email: "levi.schwartz@example.com",
      phone: "7185551003",
      address: "789 Ocean Ave, Brooklyn, NY 11226",
      isActive: true,
      memberSince: new Date("2010-01-01"),
      notes: "Regular reader of Haftorah",
    },
    {
      firstName: "Yehuda",
      lastName: "Klein",
      hebrewName: "יהודה בן דוד",
      hebrewMotherName: "יהודה בן שרה",
      email: "yehuda.klein@example.com",
      phone: "7185551004",
      address: "321 New Utrecht Ave, Brooklyn, NY 11219",
      isActive: true,
      memberSince: new Date("2020-10-05"),
      notes: null,
    },
    {
      firstName: "Yissachar",
      lastName: "Weiss",
      hebrewName: "יששכר בן נפתלי",
      hebrewMotherName: "יששכר בן חנה",
      email: "yissachar.weiss@example.com",
      phone: "7185551005",
      address: "567 18th Ave, Brooklyn, NY 11204",
      isActive: true,
      memberSince: new Date("2012-07-20"),
      notes: "Prefers to be called Shuki",
    },
    {
      firstName: "Zevulun",
      lastName: "Rosenberg",
      hebrewName: "זבולון בן ישראל",
      hebrewMotherName: "זבולון בן רבקה",
      email: "zevulun.rosenberg@example.com",
      phone: "7185551006",
      address: "890 Avenue J, Brooklyn, NY 11230",
      isActive: false,
      memberSince: new Date("2008-04-01"),
      notes: "Moved to Israel — keep in contact",
    },
    {
      firstName: "Dan",
      lastName: "Friedman",
      hebrewName: "דן בן יוסף",
      hebrewMotherName: "דן בן בלה",
      email: "dan.friedman@example.com",
      phone: "7185551007",
      address: "234 Ocean Pkwy, Brooklyn, NY 11218",
      isActive: true,
      memberSince: new Date("2019-11-11"),
      notes: null,
    },
    {
      firstName: "Naftali",
      lastName: "Stern",
      hebrewName: "נפתלי בן בנימין",
      hebrewMotherName: "נפתלי בן לאה",
      email: "naftali.stern@example.com",
      phone: "7185551008",
      address: "456 Coney Island Ave, Brooklyn, NY 11218",
      isActive: true,
      memberSince: new Date("2016-08-25"),
      notes: "Regular minyan attendee",
    },
    {
      firstName: "Gad",
      lastName: "Horowitz",
      hebrewName: "גד בן אשר",
      hebrewMotherName: "גד בן דינה",
      email: "gad.horowitz@example.com",
      phone: "7185551009",
      address: "111 Kings Hwy, Brooklyn, NY 11223",
      isActive: true,
      memberSince: new Date("2021-01-06"),
      notes: null,
    },
    {
      firstName: "Asher",
      lastName: "Levine",
      hebrewName: "אשר בן גד",
      hebrewMotherName: "אשר בן זלפה",
      email: "asher.levine@example.com",
      phone: "7185551010",
      address: "789 Avenue M, Brooklyn, NY 11230",
      isActive: true,
      memberSince: new Date("2017-05-14"),
      notes: "Baas koreh — very reliable",
    },
  ];

  const createdMembers: Array<{ id: string; firstName: string; lastName: string }> = [];

  for (const data of membersData) {
    const member = await prisma.member.upsert({
      where: {
        // use a synthetic unique key approach — check by full name+email combo
        // Since email can be null, we use id via findFirst + create
        id: "nonexistent-" + data.email,
      },
      update: {},
      create: data,
    }).catch(async () => {
      // If upsert fails (id not found), do a findFirst + create
      const existing = await prisma.member.findFirst({
        where: { email: data.email },
      });
      if (existing) return existing;
      return prisma.member.create({ data });
    });

    createdMembers.push(member);
  }

  // Link member user to first member
  if (createdMembers.length > 0 && memberUser) {
    await prisma.member.update({
      where: { id: createdMembers[0].id },
      data: { userId: memberUser.id },
    });
  }

  console.log(`Created ${createdMembers.length} members`);

  // Add life events for first few members
  const lifeEventsData = [
    {
      memberId: createdMembers[0].id,
      type: "BIRTHDAY",
      label: "Birthday",
      hebrewDay: 15,
      hebrewMonth: 1, // Nisan
      recurs: true,
      notifyGabbai: true,
    },
    {
      memberId: createdMembers[0].id,
      type: "YAHRTZEIT",
      label: "Father's Yahrtzeit",
      hebrewDay: 20,
      hebrewMonth: 7, // Tishrei
      recurs: true,
      notifyGabbai: true,
      linkedMemberName: "Yaakov Cohen",
    },
    {
      memberId: createdMembers[1].id,
      type: "ANNIVERSARY",
      label: "Wedding Anniversary",
      hebrewDay: 5,
      hebrewMonth: 6, // Elul
      recurs: true,
      notifyGabbai: false,
    },
    {
      memberId: createdMembers[2].id,
      type: "BAR_MITZVAH",
      label: "Bar Mitzvah",
      hebrewDay: 14,
      hebrewMonth: 3, // Sivan
      hebrewYear: 5760,
      recurs: false,
      notifyGabbai: false,
    },
  ];

  for (const eventData of lifeEventsData) {
    await prisma.lifeEvent.create({ data: eventData });
  }

  console.log(`Created ${lifeEventsData.length} life events`);

  // Create Shabbos schedules
  const shabbosSchedules = [
    {
      shabbosDate: new Date("2025-04-12"),
      parsha: "Tzav",
      hebrewDay: 14,
      hebrewMonth: 1,
      hebrewYear: 5785,
      notes: "Shabbos HaGadol",
    },
    {
      shabbosDate: new Date("2025-04-26"),
      parsha: "Tazria-Metzora",
      hebrewDay: 28,
      hebrewMonth: 1,
      hebrewYear: 5785,
      notes: null,
    },
    {
      shabbosDate: new Date("2025-05-03"),
      parsha: "Acharei Mot-Kedoshim",
      hebrewDay: 5,
      hebrewMonth: 2,
      hebrewYear: 5785,
      notes: null,
    },
    {
      shabbosDate: new Date("2025-05-10"),
      parsha: "Emor",
      hebrewDay: 12,
      hebrewMonth: 2,
      hebrewYear: 5785,
      notes: null,
    },
  ];

  for (const schedData of shabbosSchedules) {
    await prisma.shabbosSchedule.upsert({
      where: { shabbosDate: schedData.shabbosDate },
      update: {},
      create: schedData,
    });
  }

  console.log(`Created ${shabbosSchedules.length} Shabbos schedules`);

  // Minyan times
  const minyanTimes = [
    { name: "Shacharis", dayOfWeek: "1", time: "07:00", isActive: true },
    { name: "Shacharis", dayOfWeek: "2", time: "07:00", isActive: true },
    { name: "Shacharis", dayOfWeek: "3", time: "07:00", isActive: true },
    { name: "Shacharis", dayOfWeek: "4", time: "07:00", isActive: true },
    { name: "Shacharis", dayOfWeek: "5", time: "07:00", isActive: true },
    { name: "Shacharis", dayOfWeek: "6", time: "08:30", isActive: true },
    { name: "Shacharis", dayOfWeek: "SHABBOS", time: "09:00", isActive: true },
    { name: "Mincha", dayOfWeek: "SHABBOS", time: "17:30", isActive: true },
    { name: "Maariv", dayOfWeek: "SHABBOS", time: "21:00", isActive: true },
    { name: "Mincha-Maariv", dayOfWeek: "0", time: "20:00", isActive: true },
    { name: "Mincha-Maariv", dayOfWeek: "1", time: "20:00", isActive: true },
    { name: "Mincha-Maariv", dayOfWeek: "2", time: "20:00", isActive: true },
    { name: "Mincha-Maariv", dayOfWeek: "3", time: "20:00", isActive: true },
    { name: "Mincha-Maariv", dayOfWeek: "4", time: "20:00", isActive: true },
  ];

  for (const mt of minyanTimes) {
    await prisma.minyanTime.create({ data: mt });
  }

  console.log(`Created ${minyanTimes.length} minyan times`);

  // Default settings
  const settings = [
    { key: "shul_name", value: "Congregation Beth Israel" },
    { key: "shul_address", value: "123 Main St, Brooklyn, NY 11201" },
    { key: "shul_ein", value: "12-3456789" },
    { key: "reminder_yahrtzeit_days", value: "14" },
    { key: "reminder_no_aliyah_days", value: "365" },
    { key: "reminder_birthday_days", value: "7" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Created default settings");
  console.log("\n✅ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("  Gabbai:  gabbai@shul.local / changeme");
  console.log("  Member:  member@shul.local / changeme");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
