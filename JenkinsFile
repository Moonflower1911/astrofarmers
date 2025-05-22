pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Using mounted workspace (no clone needed)'
            }
        }

        stage('Build Backend') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }pipeline {
             agent any

             environment {
                 BACKEND_DIR = 'backend'
                 FRONTEND_DIR = 'frontend'
             }

             stages {
                 stage('Clone Repository') {
                     steps {
                         checkout scm  // Properly clones the repo
                     }
                 }

                 stage('Build Backend') {
                     steps {
                         dir("${env.BACKEND_DIR}") {
                             sh 'mvn clean package -DskipTests'
                         }
                     }
                 }

                 stage('Build Frontend') {
                     steps {
                         dir("${env.FRONTEND_DIR}") {
                             sh 'npm install'
                             sh 'nohup npm run dev > frontend.log 2>&1 &'
                         }
                     }
                 }

                 stage('Build & Deploy with Docker Compose') {
                     steps {
                         sh 'docker compose down || true'
                         sh 'docker compose build --no-cache'
                         sh 'docker compose up -d'
                     }
                 }
             }

             post {
                 success {
                     echo '✅ Deployment successful!'
                     sh 'docker ps'  // Verify running containers
                 }
                 failure {
                     echo '❌ Deployment failed!'
                 }
             }
         }

        stage('Build Frontend') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run dev'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Restart Services') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully.'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}
