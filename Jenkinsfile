pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        BACKEND_IMAGE = 'astro-backend'
        FRONTEND_IMAGE = 'astro-frontend'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '✅ Using mounted workspace — no need to clone again.'
            }
        }

        stage('Build Backend') {
            agent {
                docker {
                    image 'maven:3.9.4-eclipse-temurin-17'
                }
            }
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            agent any
            steps {
                sh 'docker compose build'
            }
        }

        stage('Restart Services') {
            agent any
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully.'
        }
        failure {
            echo '❌ Build or deployment failed.'
        }
    }
}
