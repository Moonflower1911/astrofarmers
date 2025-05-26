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

        stage('Push to Docker Hub') {
          steps {
            withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

              sh 'docker tag astro-backend meryem1911/astro-backend:latest'
              sh 'docker push meryem1911/astro-backend:latest'

              sh 'docker tag astro-frontend meryem1911/astro-frontend:latest'
              sh 'docker push meryem1911/astro-frontend:latest'
            }
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
                    sh 'kubectl get nodes'
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