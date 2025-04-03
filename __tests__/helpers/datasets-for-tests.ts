import {UserInputModel, UserViewModel} from "../../src/04-users/types/input-output-types";
import {BlogViewModel} from "../../src/05-blogs/types/input-output-types";
import {PostViewModel} from "../../src/06-posts/types/input-output-types";
import {CommentViewModel} from "../../src/07-comments/types/input-output-types";
import {AuthTokens} from "../../src/01-auth/types/auth-tokens-type";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {Blog} from "../../src/05-blogs/domain/blog-entity";
import {Post} from "../../src/06-posts/domain/post-entity";

const blog: Blog = {
    name: 'BLOG',
    description: 'DESCRIPTION',
    websiteUrl: 'https://blogs.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

const post: Post = {
    title: 'POST',
    shortDescription: 'SHORT_DESCRIPTION_POST',
    content: 'CONTENT_POST',
    blogId: '',
    blogName: blog.name,
    createdAt: new Date().toISOString(),
} as const;

const userPropertyMap: Record<string, string> = {
    id: 'id',
    login: 'login',
    email: 'email',
    createdAt: 'createdAt'
};

const blogPropertyMap: Record<string, string> = {
    id: 'id',
    name: 'name',
    description: 'description',
    websiteUrl: 'websiteUrl',
    createdAt: 'createdAt',
    isMembership: 'isMembership'
};

const postPropertyMap: Record<string, string> = {
    id: 'id',
    title: 'title',
    shortDescription: 'shortDescription',
    content: 'content',
    blogId: 'blogId',
    blogName: 'blogName',
    createdAt: 'createdAt'
};

const commentPropertyMap: Record<string, string> = {
    id: 'id',
    content: 'content',
    userLogin: 'commentatorInfo.userLogin',
    userId: 'commentatorInfo.userId',
    createdAt: 'createdAt'
};

const clearPresets = () => {
    presets.users = [];
    presets.blogs = [];
    presets.posts = [];
    presets.comments = [];
    presets.authTokens = [];
    presets.devices = [];
};

type PresetsType = {
    users: UserViewModel[],
    blogs: BlogViewModel[],
    posts: PostViewModel[],
    comments: CommentViewModel[],
    authTokens: AuthTokens[],
    devices: DeviceViewModel[]
};

const presets: PresetsType = {
    users: [],
    blogs: [],
    posts: [],
    comments: [],
    authTokens: [],
    devices: []
};

const deviceNames = ["iPhone 15", "Samsung Galaxy S24", "MacBook Pro", "iPad Pro"];

const userLogins = [
    'robert85',
    'anna404',
    'chris34',
    'megan574',
    'laura464',
    'robert186',
    'james932',
    'laura774',
    'daniel281',
    'george545',
    'john232'
] as const;

const blogNames = [
    'TechTalks',
    'CreativeVibes',
    'TheGastronome',
    'MindfulMusings',
    'WanderDiaries',
    'CodeCraft',
    'LifestyleLuxe',
    'TheHealthyLife',
    'FashionForward',
    'EcoChic',
    'TheDigitalNomad'
] as const;

const blogDescriptions = [
    'TechTalks — a blog dedicated to the latest news in the world of technology, startups, gadgets, and innovations. Here you can find reviews of the newest devices, programming tips, and useful information for anyone interested in technology.',

    'CreativeVibes — a space for all creative individuals! We share ideas for art projects, design solutions, and inspiring stories. This blog will interest artists, designers, photographers, and anyone who wants to bring their creative ideas to life.',

    'TheGastronome — a blog for true gourmets and food lovers. We share recipes, reviews of new restaurants, trends in the culinary world, and reviews of kitchen gadgets. If you want to learn how to cook or simply enjoy food, this blog is for you.',

    'MindfulMusings — a place for reflections on life, mindfulness, psychology, and self-help. We share tips for improving your quality of life, meditation, and making conscious decisions to help you be happier and more balanced.',

    'Wanderlust Diaries — a blog for those who love to travel and discover new horizons. We share guides, useful tips, and personal stories about traveling around the world. Get inspired and plan your next adventures with us.',

    'CodeCraft — a space for programmers where we share useful articles, coding lessons, best development practices, and reviews of popular frameworks and tools. Everything you need to grow in the world of technology.',

    'LifestyleLuxe — a blog about luxurious living, style, fashion, and travel. We talk about the most stylish trends, glamorous vacation spots, and the best products that will make your life more sophisticated and comfortable.',

    'TheHealthyLife — a place where we share tips on healthy living, diets, workouts, and mental well-being. Learn how to maintain balance and take care of your body and mind to live in harmony.',

    'FashionForward — a blog for those always on the lookout for the latest fashion trends. We talk about the newest arrivals in the fashion world, showcase stylish outfits, and share wardrobe tips to help you look fashionable and confident.',

    'EcoChic — a blog dedicated to ecology, sustainable fashion, and living with care for the planet. We focus on conscious choices in daily life, from eco-friendly products to trends in green fashion.',

    'TheDigitalNomad — a blog for people who travel and work remotely. We share experiences of working from various corners of the world, the best tools for digital nomads, and useful recommendations for those who choose the freedom of movement and remote work.'
] as const;

const postTitles = [
    'The Future of Tech',
    'Inspiration for Creatives',
    'Gourmet Recipes',
    'Be More Mindful Daily',
    'Best Travel Destinations 2025',
    'Master Python in 30 Days',
    'Luxury Living: Stylish Homes',
    'Healthy Lifestyle Every Day',
    'Fashion Trends 2025: Wear Now',
    'Eco-Trends: Living in Harmony',
    'Digital Nomad Life'
] as const;

const postShortDescriptions = [
    'Technology is changing rapidly. Learn what to expect in the near future with upcoming tech trends.',
    'Find out how to get inspired for your creative projects, no matter the field.',
    'Quick and tasty recipes for those who enjoy gourmet meals but have limited time to cook.',
    'Tips for living a more mindful life through meditation, self-awareness, and conscious choices.',
    'The best places to travel in 2025, from hidden gems to well-known landmarks.',
    'How to master Python programming and achieve success in the tech industry.',
    'How to create a luxurious and stylish home environment without breaking the bank.',
    'Simple and effective ways to maintain a healthy lifestyle and keep fit.',
    'The hottest fashion trends for 2025 and how to wear them with confidence.',
    'Eco-friendly practices and how they can benefit the planet and your daily life.',
    'How to balance work and travel as a digital nomad while living life on your terms.'
] as const;

const postContents = [
    'Technology is evolving faster than ever. This post covers key trends such as artificial intelligence, virtual reality, and biotechnology that will change the world in the coming years.',
    'Creativity often doesn’t come on demand, but finding the right sources of inspiration can help you create something great. In this article, we explore how to find inspiration in your daily life and apply it to your work.',
    'Cooking gourmet meals doesn’t have to be time-consuming. We’ve put together a collection of easy-to-follow recipes that are both delicious and quick to prepare, perfect for busy people who still want to enjoy great food.',
    'Mindfulness is essential for improving the quality of life. This post offers practical tips on how to incorporate mindfulness into your daily routine, helping you live with intention and focus.',
    '2025 is just around the corner, and we’ve compiled a list of the best travel destinations to visit next year. From hidden treasures to well-known landmarks, these destinations offer unforgettable experiences.',
    'Python is one of the most popular programming languages today. In this post, we provide a 30-day roadmap to mastering Python and becoming an expert, from basic syntax to advanced topics like web development and data analysis.',
    'Luxury living isn’t just about expensive items—it’s about creating a stylish and comfortable home that makes you feel good. In this post, we share tips on how to decorate your home with elegance and sophistication.',
    'Maintaining a healthy lifestyle is essential for long-term well-being. This article provides simple and effective strategies for staying active, eating well, and taking care of your mental health.',
    'Fashion is constantly evolving, and staying up to date with the latest trends is key. In this post, we explore the biggest fashion trends of 2025 and how to incorporate them into your wardrobe.',
    'Sustainability is more important than ever. In this article, we discuss how eco-friendly practices can positively impact the environment and your lifestyle, from reducing waste to adopting renewable energy solutions.',
    'Remote work offers freedom and flexibility, but it also comes with its own set of challenges. This post provides insights into how digital nomads can work from anywhere in the world while traveling and enjoying the freedom of the open road.'
] as const;

const comments = [
    "This blog post provides an excellent overview of the topic. Great job!",
    "I really enjoyed reading this article. The insights were valuable and well-presented.",
    "Your perspective on this subject is refreshing and thought-provoking. Thanks for sharing!",
    "This is exactly what I was looking for. The information is clear and concise. Thank you!",
    "Fantastic post! The points you made were insightful and well-researched. Keep it up!",
    "The way you explained the concept is so simple and easy to understand. Kudos!",
    "I learned so much from this article. It's packed with useful information and tips. Great work!",
    "This is such an interesting read! I appreciate the effort put into making this informative.",
    "You covered the topic so comprehensively. It answered all my questions. Thank you!",
    "This post is a great resource for anyone interested in the topic. Highly recommend reading it.",
    "Your article stood out because of its clarity and depth. It's both informative and engaging!"
] as const;

const user: UserInputModel = {
    login: userLogins[0],
    email: `${userLogins[0]}@example.com`,
    password: userLogins[0]
} as const;

const incorrectAccessToken: string = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzllNDkwYmMyNzQyZjQ2Y2ZlYWYyMzgiLCJpYXQiOjE3Mzg0MjY2MzUsImV4cCI6MTczODU5OTQzNX0.jnr_jbzaBr9WZhGzZQWQZsK4Bd4VcovtQ5NsKJ8TYzE` as const;

export {
    blog,
    post,
    user,
    userPropertyMap,
    blogPropertyMap,
    postPropertyMap,
    commentPropertyMap,
    presets,
    deviceNames,
    userLogins,
    blogNames,
    blogDescriptions,
    postTitles,
    postShortDescriptions,
    postContents,
    comments,
    clearPresets,
    incorrectAccessToken
};