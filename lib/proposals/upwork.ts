type Job = {
  title: string;
  description?: string | null;
  budget?: string | null;
  client_info?: string | null;
  recommended_package?: string | null;
};

export function buildOpenClawProposal(job: Job) {
  const pkg = job.recommended_package || 'B';
  const packageMap: Record<string, string> = {
    A: 'OpenClaw Quick Setup Audit ($500)',
    B: 'OpenClaw Setup + Mission Control Base ($1,500)',
    C: 'OpenClaw Team Setup + Workflow Delivery ($3,000)',
    D: 'OpenClaw Full Infrastructure + Ops Layer ($5,000+)',
  };

  const coverLetter = `Hi there,\n\nI reviewed your requirement: "${job.title}".\n\nThis is exactly the kind of OpenClaw setup I deliver: secure local install, gateway + browser relay, mission-control dashboard, and a clean operator runbook your team can actually use.\n\nWhat I will deliver:\n1) OpenClaw installation and hardened config\n2) Browser relay + tool access validation\n3) Mission Control setup with jobs pipeline and team routing\n4) Starter workflow(s) configured and tested\n5) Handoff docs + quick training\n\nRecommended package: ${packageMap[pkg] || packageMap.B}\n\nI’m confident we can ship this quickly and keep it stable, with boring reliability over clever hacks.\n\nIf helpful, I can start with a short discovery pass and confirm exact scope before implementation.\n\nBest,\nZed`;

  const qa = [
    {
      q: 'Have you built similar projects?',
      a: 'Yes. I have already delivered OpenClaw setup + Mission Control implementation in production-like environments, including gateway auth, browser relay, and operating runbooks.',
    },
    {
      q: 'How will you deliver without remote access?',
      a: 'I provide a setup kit and guided bootstrap process with verification steps. If needed, we do a short supervised session for final validation.',
    },
    {
      q: 'How do you handle security?',
      a: 'Local-first defaults, loopback bind, token auth, explicit approval gates for external actions, and documented operational checks.',
    },
  ];

  return { coverLetter, qa };
}
