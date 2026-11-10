
import prisma from "../src/config/database.js";

const subjects = [
  {
    name: "Engineering Mathematics",
    code: "EM",
    topics: [
      "Discrete Mathematics",
      "Linear Algebra",
      "Calculus",
      "Probability and Statistics",
    ],
  },
  {
    name: "Digital Logic",
    code: "DL",
    topics: [
      "Boolean Algebra",
      "Combinational Circuits",
      "Sequential Circuits",
      "Number Systems",
      "Computer Arithmetic",
    ],
  },
  {
    name: "Computer Organization and Architecture",
    code: "COA",
    topics: [
      "Machine Instructions",
      "Addressing Modes",
      "ALU and Datapath",
      "Control Unit",
      "Pipelining",
      "Memory Hierarchy",
      "Input Output Organization",
    ],
  },
  {
    name: "Programming and Data Structures",
    code: "PDS",
    topics: [
      "C Programming",
      "Recursion",
      "Arrays",
      "Stacks",
      "Queues",
      "Linked Lists",
      "Trees",
      "Binary Search Trees",
      "Heaps",
      "Graphs",
    ],
  },
  {
    name: "Algorithms",
    code: "ALGO",
    topics: [
      "Asymptotic Analysis",
      "Searching and Sorting",
      "Divide and Conquer",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Graph Algorithms",
      "NP-Completeness",
    ],
  },
  {
    name: "Theory of Computation",
    code: "TOC",
    topics: [
      "Regular Expressions",
      "Finite Automata",
      "Context Free Grammars",
      "Pushdown Automata",
      "Turing Machines",
      "Undecidability",
    ],
  },
  {
    name: "Compiler Design",
    code: "CD",
    topics: [
      "Lexical Analysis",
      "Parsing",
      "Syntax Directed Translation",
      "Runtime Environments",
      "Intermediate Code Generation",
      "Code Optimization",
      "Data Flow Analysis",
    ],
  },
  {
    name: "Operating Systems",
    code: "OS",
    topics: [
      "System Calls",
      "Processes and Threads",
      "Inter Process Communication",
      "Process Synchronization",
      "Deadlocks",
      "CPU Scheduling",
      "Memory Management",
      "Virtual Memory",
      "File Systems",
    ],
  },
  {
    name: "Database Management Systems",
    code: "DBMS",
    topics: [
      "ER Model",
      "Relational Model",
      "SQL",
      "Relational Algebra",
      "Relational Calculus",
      "Database Constraints",
      "Normalization",
      "Indexing",
      "Transactions",
      "Concurrency Control",
      "Database Recovery",
    ],
  },
  {
    name: "Computer Networks",
    code: "CN",
    topics: [
      "OSI and TCP IP Models",
      "Network Switching",
      "IPv4 and IPv6",
      "Routing Algorithms",
      "TCP and UDP",
      "Congestion Control",
      "Application Layer Protocols",
    ],
  },
  {
    name: "General Aptitude",
    code: "GA",
    topics: [
      "Verbal Aptitude",
      "Analytical Aptitude",
      "Quantitative Aptitude",
      "Spatial Aptitude",
    ],
  },
];

async function seedDatabase() {
  console.log("Starting GATE CS database seeding...\n");

  for (const subjectData of subjects) {
    const { topics, ...subjectInfo } = subjectData;

    const subject = await prisma.subject.upsert({
      where: { code: subjectInfo.code },
      update: { name: subjectInfo.name },
      create: subjectInfo,
    });

    for (const topicName of topics) {
      await prisma.topic.upsert({
        where: {
          name_subjectId: {
            name: topicName,
            subjectId: subject.id,
          },
        },
        update: {},
        create: {
          name: topicName,
          subjectId: subject.id,
        },
      });
    }

    console.log(
      `Added: ${subject.name} (${topics.length} topics)`
    );
  }

  const subjectCount = await prisma.subject.count();
  const topicCount = await prisma.topic.count();

  console.log("\nDatabase seeding completed!");
  console.log(`Total subjects: ${subjectCount}`);
  console.log(`Total topics: ${topicCount}`);
}

seedDatabase()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
