export const classSubjectMapping = {
    "Class1": ["English", "Mathematics", "Science", "Social Science", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "Computer"],
    "Class2": ["English", "Mathematics", "Science", "Social Science", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "Computer"],
    "Class3": ["English", "Mathematics", "Science", "Social Science", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "Computer"],
    "Class4": ["English", "Mathematics", "Science", "Social Science", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "Computer"],
    "Class5": ["English", "Mathematics", "History and Civics", "Geography", "Science", "Computer", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "3rd Language(Bengali)", "3rd Language(Hindi)", "GK"],
    "Class6": ["English", "Mathematics", "History and Civics", "Geography", "Computer", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "3rd Language(Bengali)", "3rd Language(Hindi)", "Physics", "Chemistry", "Biology", "GK"],
    "Class7A": ["English", "Mathematics", "History and Civics", "Geography", "Computer", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "3rd Language(Bengali)", "3rd Language(Hindi)", "Physics", "Chemistry", "Biology", "GK"],
    "Class7B": ["English", "Mathematics", "History and Civics", "Geography", "Computer", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "3rd Language(Bengali)", "3rd Language(Hindi)", "Physics", "Chemistry", "Biology", "GK"],
    "Class8": ["English", "Mathematics", "History and Civics", "Geography", "Computer", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "3rd Language(Bengali)", "3rd Language(Hindi)", "Physics", "Chemistry", "Biology", "GK"],
    "Class9A": ["English", "Mathematics", "Science(Combined)", "Science(Bio)", "Science(Chem)", "Science(Phy)", "SST(Combined)", "SST(Geo)", "SST(Hist)", "SST(Pol Sc)", "SST(Econ)", "Information Technology", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)"],
    "Class9B": ["English", "Mathematics", "Science(Combined)", "Science(Bio)", "Science(Chem)", "Science(Phy)", "SST(Combined)", "SST(Geo)", "SST(Hist)", "SST(Pol Sc)", "SST(Econ)", "Information Technology", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)"],
    "Class11_Sci": ["English", "Physical Education", "Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "IP", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)"],
    "Class11_Humanities": ["English", "Physical Education", "Political Science", "Sociology", "History", "Geography", "Economics", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "IP"],
    "Class11_Commerce": ["English", "Physical Education", "Accountancy", "Business Studies", "Economics", "Entrepreneurship", "2nd Language(Hindi)", "2nd Language(Nepali)", "2nd Language(Bengali)", "Informatics Practice", "Mathematics"]
};

export const getFilteredSubjectsForClass = (className, allSubjects) => {
    if (!className) return allSubjects; // show all if no class selected
    const allowedSubjectNames = classSubjectMapping[className] || [];
    return allSubjects.filter(s => allowedSubjectNames.includes(s.name));
};
