pipeline {
    agent any

    environment {
        FRONTEND_DIR = 'frontend'
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm  // Properly clones the repo
            }
        }

        stage('Run Frontend in Dev Mode') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'nohup npm run dev > frontend.log 2>&1 &'  // Run in background
                }
            }
        }

        stage('Start Backend & Database') {
            steps {
                sh 'docker compose up -d backend postgres'  // Only start required services
            }
        }
    }

    post {
        success {
            echo '✅ Frontend running in dev mode! Access at http://localhost:3000'
            echo '✅ Backend running at http://localhost:8080'
        }
        failure {
            echo '❌ Deployment failed! Check logs.'
        }
    }
}
