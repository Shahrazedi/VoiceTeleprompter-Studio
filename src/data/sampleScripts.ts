import { Script } from '../types';

export const SAMPLE_SCRIPTS: Script[] = [
  {
    id: 'script-1',
    title: 'مقدمة بودكاست التقنية اليوم - حلقة الذكاء الاصطناعي',
    content: `مرحباً بكم مستمعينا الكرام في حلقة جديدة من بودكاست التقنية اليوم.
اليوم سنتحدث عن ثورة الذكاء الاصطناعي وكيف تغير حياتنا اليومية وأعمالنا بشكل جذرعي.
من الرعاية الصحية إلى التعليم والترفيه، الأدوات الذكية أصبحت جزءاً لا يتجزأ من مستقبلنا.
دعونا نستعرض أبرز الابتكارات التي ظهرت هذا الأسبوع ونناقش تأثيرها على سوق العمل.
لا تنسوا الاشتراك في القناة ومشاركة الحلقة مع أصدقائكم المهتمين بالتقنية.
شكراً لحسن استماعكم ونراكم في الحلقة القادمة.`,
    category: 'podcast',
    language: 'ar',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'script-2',
    title: 'النشرة الإخبارية الصباحية - الاقتصاد والتجارة',
    content: `صباح الخير، إليكم موجز لأهم وأبرز الأخبار الاقتصادية لهذا اليوم.
سجلت الأسواق المالية استقراراً ملحوظاً في تداولات الصباح المبكرة مع ارتفاع طفيف في أسهم قطاع الطاقة المتجددة.
أعلنت الحكومة عن حزمة تحفيز جديدة لدعم الشركات الناشئة ورواد الأعمال في مجالات التكنولوجيا الخضراء.
على صعيد العملات، حافظ الدولار على مستوياته أمام العملات الرئيسية وسط ترقب لقرارات البنك المركزي القادمة.
ننتقل الآن إلى الزميل لمتابعة تفاصيل الأخبار الإقليمية والدولية.`,
    category: 'news',
    language: 'ar',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'script-3',
    title: 'قصة قصيرة: رحلة النجوم والأحلام',
    content: `في ليلة صيفية صافية، حيث تلمع النجوم في السماء كألماس منثور، جلس الفتى الصغير يتأمل الكون من شرفته العتيقة.
كان يتساءل دائماً: ماذا يوجد وراء تلك المجرات البعيدة؟ هل هناك عوالم أخرى تنتظر من يكتشفها؟
لم تكن تلك مجرد تساؤلات عابرة، بل كانت شرارة حلم كبير قاده لدراسة علوم الفلك والفضاء بجد و شغف طوال سنين شبابه.
واليوم، وبعد تعب وجهد طويل، يقف مهندساً رئيسياً في محطة إطلاق المركبات الفضائية ليرى حلمه يتحول إلى حقيقة نابضة بالحياة.`,
    category: 'story',
    language: 'ar',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'script-4',
    title: 'Journal du Tech - Épisode Spécial Innovation',
    content: `Bonjour et bienvenue dans notre journal technologique quotidien.
Aujourd'hui, nous explorons les dernières avancées en matière d'intelligence artificielle et de développement durable.
Les nouvelles technologies transforment non seulement nos méthodes de travail, mais aussi notre façon de concevoir l'énergie propre.
Restez avec nous pour découvrir les interviews exclusives d'entrepreneurs visionnaires qui façonnent le monde de demain.
N'oubliez pas de vous abonner et de partager notre émission sur vos réseaux sociaux favoris.`,
    category: 'podcast',
    language: 'fr',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  }
];
