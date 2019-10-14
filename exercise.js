const moment = require("moment");
const { pipe, reduce, map, path, applySpec, prop } = require("ramda");

const { freelance } = require("./examples/freelancer.json");

function addTimeRange(timeRange, monthsSet = new Set()) {
  const [rangeStart, rangeEnd] = timeRange;

  const month = moment.parseZone(rangeStart);
  const end = moment.parseZone(rangeEnd);

  while (month.diff(end, "M")) {
    monthsSet.add(month.format());

    month.add(1, "month");
  }

  return monthsSet;
}

function computeSkillUniqueMonths(skillsMap, experience) {
  const { startDate, endDate, skills } = experience;

  return reduce(
    (skillsMap, skill) => ({
      ...skillsMap,
      [skill.id]: {
        ...skill,
        months: addTimeRange(
          [startDate, endDate],
          path([skill.id, "months"], skillsMap)
        )
      }
    }),
    skillsMap,
    skills
  );
}

function computeSkillsUniqueMonths(experiences) {
  return reduce(computeSkillUniqueMonths, {}, experiences);
}

const formatSkill = applySpec({
  id: prop("id"),
  name: prop("name"),
  durationInMonths: path(["months", "size"])
});

const computeFreelancerSkills = applySpec({
  freelance: {
    id: prop("id"),
    computedSkills: pipe(
      prop("professionalExperiences"),
      computeSkillsUniqueMonths,
      Object.values,
      map(formatSkill)
    )
  }
});

console.log(JSON.stringify(computeFreelancerSkills(freelance), null, 2));
