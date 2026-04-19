const mockData = {
  jobs: [
    {
      id: 'job_001',
      title: 'Senior Python Developer',
      company: 'TechCorp Inc',
      location: 'San Francisco, CA',
      skills: ['Python', 'AWS', 'Docker', 'Kubernetes'],
      experience: 5,
      description: 'We are seeking a Senior Python Developer with extensive experience in AWS and containerization technologies. Must have 5+ years of professional experience.'
    },
    {
      id: 'job_002',
      title: 'Full-Stack JavaScript Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 3,
      description: 'Looking for a Full-Stack Engineer proficient in React and Node.js. Experience with MongoDB and RESTful API design required.'
    },
    {
      id: 'job_003',
      title: 'Data Scientist',
      company: 'DataSolutions LLC',
      location: 'Boston, MA',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      experience: 4,
      description: 'Seeking a Data Scientist with expertise in machine learning and deep learning. Strong Python and SQL skills needed.'
    },
    {
      id: 'job_004',
      title: 'Cloud Architect',
      company: 'CloudFirst Corp',
      location: 'Seattle, WA',
      skills: ['AWS', 'Azure', 'Terraform', 'Docker'],
      experience: 7,
      description: 'We need an experienced Cloud Architect to design and implement scalable infrastructure using AWS and Terraform.'
    },
    {
      id: 'job_005',
      title: 'Frontend Engineer',
      company: 'DesignStudio',
      location: 'Los Angeles, CA',
      skills: ['React', 'CSS', 'JavaScript', 'TypeScript'],
      experience: 2,
      description: 'Passionate Frontend Engineer with React expertise. Knowledge of TypeScript and modern CSS frameworks is a plus.'
    }
  ],

  candidates: [
    {
      id: 'cand_001',
      name: 'John Doe',
      title: 'Full-Stack Engineer',
      location: 'San Francisco, CA',
      skills: ['Python', 'AWS', 'Docker', 'React', 'JavaScript'],
      experience: 6,
      summary: 'Experienced full-stack engineer with 6 years in Python and AWS. Proficient in Docker and modern web frameworks.'
    },
    {
      id: 'cand_002',
      name: 'Jane Smith',
      title: 'Senior Data Scientist',
      location: 'Boston, MA',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL'],
      experience: 8,
      summary: 'Senior Data Scientist with expertise in ML/DL. Strong background in TensorFlow and SQL.'
    },
    {
      id: 'cand_003',
      name: 'Michael Johnson',
      title: 'JavaScript Developer',
      location: 'New York, NY',
      skills: ['JavaScript', 'React', 'Node.js', 'Vue.js', 'TypeScript'],
      experience: 5,
      summary: 'Full-Stack JavaScript developer with 5 years experience. Expert in React and Node.js.'
    },
    {
      id: 'cand_004',
      name: 'Sarah Williams',
      title: 'DevOps Engineer',
      location: 'Seattle, WA',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      experience: 4,
      summary: 'DevOps engineer specializing in AWS infrastructure and containerization. Strong Terraform skills.'
    },
    {
      id: 'cand_005',
      name: 'Robert Brown',
      title: 'Frontend Developer',
      location: 'Los Angeles, CA',
      skills: ['React', 'CSS', 'JavaScript', 'HTML', 'Webpack'],
      experience: 3,
      summary: 'Frontend developer focused on React and modern CSS. 3 years of professional experience.'
    }
  ]
};

module.exports = mockData;