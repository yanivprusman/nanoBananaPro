interface IoTProjectData {
  name: string;
  description?: string;
  mcu?: string;
  components: { name: string; category: string; quantity: number; notes?: string }[];
}

export function buildIoTVisualizationPrompt(
  project: IoTProjectData,
  userNotes?: string,
): string {
  const componentList = project.components
    .map((c) => `- ${c.name} x${c.quantity} (${c.category})${c.notes ? ` — ${c.notes}` : ""}`)
    .join("\n");

  const sensors = project.components.filter((c) => c.category === "sensor");
  const actuators = project.components.filter((c) => c.category === "actuator");
  const mechanical = project.components.filter((c) => c.category === "mechanical");

  let prompt = `Create a detailed, realistic product visualization of an IoT project called "${project.name}".`;

  if (project.description) {
    prompt += `\n\nProject description: ${project.description}`;
  }

  if (project.mcu) {
    prompt += `\nMicrocontroller: ${project.mcu}`;
  }

  prompt += `\n\nComponents:\n${componentList}`;

  prompt += `\n\nRequirements:
- Show the finished assembled product as a 3D-style product photo
- Render it as a clean, professional product visualization on a neutral background
- Show key interactive elements clearly: ${sensors.map((s) => s.name).join(", ") || "various sensors"}
- Show output elements: ${actuators.map((a) => a.name).join(", ") || "various actuators"}`;

  if (mechanical.length > 0) {
    prompt += `\n- Show the enclosure/housing: ${mechanical.map((m) => m.name).join(", ")}`;
  }

  prompt += `\n- Make it look like a polished, finished product — not a prototype on a breadboard
- Use warm, appealing lighting
- The image should look like it belongs on a product page or Kickstarter campaign`;

  if (userNotes) {
    prompt += `\n\nAdditional instructions from the designer:\n${userNotes}`;
  }

  return prompt;
}
