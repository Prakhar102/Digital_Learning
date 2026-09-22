/**
 * Curated High-Definition 3D Tech Course Banners & Dynamic Thumbnail Matcher
 * Maps course titles & categories (AI, Python, Java, SpringBoot, Microservices, etc.)
 * to vivid, high-resolution 3D artwork.
 */

export const TECH_THUMBNAIL_PRESETS = [
  {
    id: "ai-system-design",
    category: "AI & System Design",
    keywords: ["ai", "system design", "architecture", "distributed", "llm", "deep learning", "gpt"],
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    label: "3D AI System Design & Neural Processor",
  },
  {
    id: "fullstack-ai-bootcamp",
    category: "Full Stack & Python",
    keywords: ["full stack", "python", "bootcamp", "web dev", "django", "flask", "react"],
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    label: "Full Stack Python, Icons & Cloud Tech",
  },
  {
    id: "robotics-penetration-testing",
    category: "Cybersecurity & Pentesting",
    keywords: ["cyber", "security", "penetration", "pentest", "ethical hacking", "robot", "network"],
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    label: "Robotics Cyber Security & SOC Lab",
  },
  {
    id: "spring-boot-microservices",
    category: "Java & Microservices",
    keywords: ["spring", "springboot", "java", "microservices", "cloud gateway", "kafka", "backend"],
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    label: "Spring Boot Microservices & Cloud Cluster",
  },
  {
    id: "cloud-devops-kubernetes",
    category: "DevOps & Cloud",
    keywords: ["cloud", "devops", "kubernetes", "docker", "aws", "azure", "ci/cd", "terraform"],
    url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
    label: "Cloud Native Kubernetes & DevOps",
  },
  {
    id: "data-science-machine-learning",
    category: "Data Science & ML",
    keywords: ["data", "machine learning", "ml", "analytics", "pandas", "pytorch", "tensorflow"],
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    label: "3D Data Analytics & Neural Graphs",
  },
  {
    id: "react-frontend-mastery",
    category: "Frontend & JavaScript",
    keywords: ["react", "javascript", "typescript", "frontend", "next.js", "tailwind", "ui"],
    url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    label: "React 19 & Modern Modern UI Architecture",
  },
  {
    id: "blockchain-smart-contracts",
    category: "Web3 & Blockchain",
    keywords: ["blockchain", "web3", "crypto", "solidity", "ethereum", "smart contracts"],
    url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    label: "3D Holographic Blockchain & Cryptography",
  },
];

/**
 * Automatically determine the best 3D thumbnail based on title, category, or description
 * @param {string} title
 * @param {string} category
 * @returns {string} Image URL
 */
export function getAutoThumbnail(title = "", category = "") {
  const query = `${title} ${category}`.toLowerCase();

  for (const preset of TECH_THUMBNAIL_PRESETS) {
    if (preset.keywords.some((kw) => query.includes(kw))) {
      return preset.url;
    }
  }

  // Deterministic fallback based on title hash
  const hash = query.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = Math.abs(hash) % TECH_THUMBNAIL_PRESETS.length;
  return TECH_THUMBNAIL_PRESETS[index].url;
}
