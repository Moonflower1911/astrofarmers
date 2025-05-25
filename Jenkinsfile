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

        // New stage added for backend auth tests
        stage('Run Backend Auth Tests') {
            steps {
                script {
                    docker.image('maven:3.9.4-eclipse-temurin-17').inside {
                        dir("${env.BACKEND_DIR}") {
                            sh 'mvn test -Dtest=AuthServiceTest,AuthControllerTest'
                        }
                    }
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        dir("${env.FRONTEND_DIR}") {
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    docker.image('maven:3.9.4-eclipse-temurin-17').inside {
                        dir("${env.BACKEND_DIR}") {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        dir("${env.FRONTEND_DIR}") {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Restart Services') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh 'kubectl apply -f k8s/postgres.yaml -n astrofarmers'
                    sh 'kubectl apply -f k8s/backend-config.yaml -n astrofarmers'
                    sh 'kubectl apply -f k8s/db-credentials.yaml -n astrofarmers'
                    sh 'kubectl apply -f k8s/backend.yaml -n astrofarmers'
                    sh 'kubectl apply -f k8s/frontend.yaml -n astrofarmers'
                }
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