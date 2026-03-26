import cron from "node-cron";
import { computeReminders } from "./reminders";
import { sendReminderDigest } from "./email";
import { prisma } from "./prisma";

let started = false;

export function startCronJobs() {
  if (started) return;
  started = true;
  // Daily at 6 AM
  cron.schedule("0 6 * * *", async () => {
    console.log("[cron] Running daily reminder check...");
    try {
      const [alerts, gabbaiEmailSetting] = await Promise.all([
        computeReminders(),
        prisma.setting.findUnique({ where: { key: "gabbaiEmail" } }),
      ]);
      console.log(`[cron] Found ${alerts.length} alerts`);
      if (alerts.length > 0 && gabbaiEmailSetting?.value) {
        await sendReminderDigest(alerts, gabbaiEmailSetting.value);
        console.log(`[cron] Reminder digest sent to ${gabbaiEmailSetting.value}`);
      }
    } catch (err) {
      console.error("[cron] Error running reminder check:", err);
    }
  });
  console.log("[cron] Cron jobs started.");
}
