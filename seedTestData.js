const mongoose = require('mongoose');
const Survey = require('../models/Survey');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb+srv://admin_orphans:Mon243253efdf@orphans-care.0i5s7pm.mongodb.net/orphans_care')
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة البيانات');
    return seed();
  })
  .catch(err => console.error('❌ فشل الاتصال:', err));

async function seed() {
  try {
    const samples = [];

    for (let i = 1; i <= 10; i++) {
      samples.push({
        fullName: `مشارك ${i}`,
        email: `user${i}@test.com`,
        phone: `09${i}000000${i}`,
        country: i % 2 === 0 ? 'سوريا' : 'تركيا',
        organization: i % 2 === 0 ? 'جمعية الأمل' : 'مؤسسة الخير',
        organizationCode: `ORG-${i}`,
        jobTitle: 'أخصائي نفسي',
        experience: `${i} سنوات`,
        ageGroups: ['6-12', '13-18'],
        careTypes: ['رعاية نفسية', 'رعاية اجتماعية'],
        previousTraining: i % 2 === 0 ? 'نعم' : 'لا',

        psychologicalTrauma: randomScore(),
        selfConfidence: randomScore(),
        psychologicalCounseling: randomScore(),
        socialIntegration: randomScore(),
        effectiveCommunication: randomScore(),

        modernTeaching: randomScore(),
        learningDifficulties: randomScore(),
        talentDevelopment: randomScore(),
        motivationTechniques: randomScore(),
        careerGuidance: randomScore(),

        firstAid: randomScore(),
        healthCare: randomScore(),
        nutrition: randomScore(),
        commonDiseases: randomScore(),
        personalHygiene: randomScore(),

        religiousValues: randomScore(),
        teachingWorship: randomScore(),
        spiritualAwareness: randomScore(),
        religiousRules: randomScore(),
        religiousIdentity: randomScore(),

        recreationalActivities: randomScore(),
        tripsOrganization: randomScore(),
        eventsOrganization: randomScore(),
        leisureTime: randomScore(),
        sportsTraining: randomScore(),

        otherTrainingAreas: '',
        suggestions: 'لا يوجد حاليًا',
        createdAt: new Date(),
      });
    }

    await Survey.insertMany(samples);
    console.log('✅ تم إدخال بيانات تجريبية بنجاح');
    process.exit();
  } catch (err) {
    console.error('❌ خطأ أثناء الإدخال:', err);
    process.exit(1);
  }
}

function randomScore() {
  return Math.floor(Math.random() * 5) + 1;
}
