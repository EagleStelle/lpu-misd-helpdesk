import { supabase } from "../config/database.js";

export async function logActivity({
  adminId,
  actionType,
  targetId = null,
  targetLabel = null,
  metadata = {},
}) {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      admin_id: adminId,
      action_type: actionType,
      target_id: targetId != null ? String(targetId) : null,
      target_label: targetLabel,
      metadata,
    });
    if (error) {
      console.error("[Activity Log Error]:", error.message);
    }
  } catch (err) {
    console.error("[Activity Log Error]:", err.message);
  }
}
