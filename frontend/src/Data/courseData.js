// Course data - centralized data file
const courses = [
    {
        id: 1,
        title: 'Full Stack Web Development Bootcamp',
        category: 'Web Development',
        description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects from scratch and become a job-ready full stack developer.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtu.be/-42K44A1oMA?si=f4BWeSv8XkAocb-V',
        badge: 'popular',
        duration: '45 hours',
        level: 'Beginner to Advanced',
        modules: 12,
        instructor: 'John Doe'
    },
    {
        id: 2,
        title: 'Java Learning A-Z',
        category: 'JAVA',
        description: 'Comprehensive Java tutorial for beginners. Learn core Java concepts, OOP, collections, multithreading, and build practical applications.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfNyr55kwJPWbgxB5&si=LRL9X6R1SkAFJC5c',
        badge: 'new',
        duration: '30 hours',
        level: 'Beginner',
        modules: 8,
        instructor: 'Jane Smith'
    },
    {
        id: 3,
        title: 'Complete UI/UX Design Masterclass',
        category: 'UI/UX Design',
        description: 'Learn Figma, Adobe XD, user research, wireframing, prototyping, and design systems from scratch. Create stunning user interfaces and experiences.',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtu.be/c9Wg6Cb_YlU?si=-iI7SufXeI7-hsHv',
        badge: 'popular',
        duration: '25 hours',
        level: 'All Levels',
        modules: 10,
        instructor: 'Sarah Johnson'
    },
    {
        id: 4,
        title: 'Flutter & Dart for Beginners',
        category: 'Mobile Development',
        description: 'Build beautiful native mobile apps for iOS and Android using Flutter and Dart programming language. From basics to advanced app development.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLXC_gcsKLD6n7p6tHPBxsKjN5hA_quaPI&si=XdkcvmCJ1wd7Hvw0',
        badge: 'free',
        duration: '20 hours',
        level: 'Beginner',
        modules: 7,
        instructor: 'Mike Wilson'
    },
    {
        id: 5,
        title: 'Artificial Intelligence Fundamentals',
        category: 'AI & Machine Learning',
        description: 'Understand AI concepts, neural networks, deep learning, and build your first AI models. Hands-on projects with Python and TensorFlow.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtu.be/D1eL1EnxXXQ?si=H6ZqT-GE7Ggnoqkf',
        badge: 'new',
        duration: '35 hours',
        level: 'Intermediate',
        modules: 9,
        instructor: 'Dr. Alex Brown'
    },
    {
        id: 6,
        title: 'Digital Marketing Mastery',
        category: 'Business',
        description: 'Master SEO, social media marketing, Google Ads, content marketing, and analytics tools. Learn strategies to grow brands online.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLXwTOG3-tRwiJmAyVJ47SVvv-dUIy2S0I&si=gNcLuJGbA83qlm9Z',
        badge: 'popular',
        duration: '28 hours',
        level: 'All Levels',
        modules: 11,
        instructor: 'Emily Davis'
    },
    {
        id: 7,
        title: 'AWS Cloud Practitioner Essentials',
        category: 'Cloud Computing',
        description: 'Learn AWS fundamentals, services, security, and prepare for AWS Certified Cloud Practitioner exam. Hands-on labs and real-world scenarios.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLxCzCOWd7aiHRHVUtR-O52MsrdUSrzuy4&si=vQ_qUwkxYjnuO63W',
        badge: 'free',
        duration: '18 hours',
        level: 'Beginner',
        modules: 6,
        instructor: 'Chris Lee'
    },
    {
        id: 8,
        title: 'Ethical Hacking & Cybersecurity',
        category: 'Cybersecurity',
        description: 'Learn penetration testing, network security, cryptography, and ethical hacking techniques. Protect systems and networks from cyber threats.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLLKT__MCUeixqHJ1TRqrHsEd6_EdEvo47&si=RO4HrUYiTQzbyWaI',
        badge: 'new',
        duration: '40 hours',
        level: 'Intermediate to Advanced',
        modules: 14,
        instructor: 'David Miller'
    },
    {
        id: 9,
        title: 'Python Programming Masterclass',
        category: 'Programming',
        description: 'From zero to hero in Python programming. Learn data structures, algorithms, web scraping, automation, and build real-world projects.',
        image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtu.be/rfscVS0vtbw',
        badge: 'popular',
        duration: '32 hours',
        level: 'Beginner',
        modules: 9,
        instructor: 'Lisa Taylor'
    },
    {
        id: 10,
        title: 'React & Redux Complete Guide',
        category: 'Frontend Development',
        description: 'Master modern React with Hooks, Context API, and Redux. Build scalable single-page applications with best practices and performance optimization.',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3',
        badge: 'new',
        duration: '26 hours',
        level: 'Intermediate',
        modules: 8,
        instructor: 'Mark Anderson'
    },
    {
        id: 11,
        title: 'Data Science & Machine Learning Bootcamp',
        category: 'Data Science',
        description: 'Learn Python, Pandas, NumPy, Scikit-learn, and build machine learning models. Work with real datasets and create predictive analytics solutions.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtu.be/LHBE6Q9XlzI',
        badge: 'popular',
        duration: '42 hours',
        level: 'Intermediate',
        modules: 12,
        instructor: 'Dr. Rachel Green'
    },
    {
        id: 12,
        title: 'Blockchain & Cryptocurrency Fundamentals',
        category: 'Blockchain',
        description: 'Understand blockchain technology, cryptocurrencies, smart contracts, and decentralized applications. Build your first blockchain project.',
        image: 'https://images.unsplash.com/photo-1616486029423-aaa561c9b5c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://youtube.com/playlist?list=PLzvRQMJ9HDiT7h3BdQwK9dgBJM8O49w9p',
        badge: 'new',
        duration: '22 hours',
        level: 'Beginner to Intermediate',
        modules: 7,
        instructor: 'Tom White'
    }
];

// Helper functions
export const getCourseById = (id) => {
    return courses.find(course => course.id === parseInt(id));
};

export const getCoursesByCategory = (category) => {
    return courses.filter(course => 
        course.category.toLowerCase().includes(category.toLowerCase())
    );
};

export const getPopularCourses = () => {
    return courses.filter(course => course.badge === 'popular');
};

export const getNewCourses = () => {
    return courses.filter(course => course.badge === 'new');
};

export const getFreeCourses = () => {
    return courses.filter(course => course.badge === 'free');
};

export const getAllCourses = () => {
    return [...courses];
};

export const getCategories = () => {
    return [...new Set(courses.map(course => course.category))];
};

export default courses;