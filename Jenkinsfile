pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        DOCKER_COMPOSE_FILE = 'docker-compose.app.yml'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building backend and frontend Docker images...'
                sh "docker-compose -f ${DOCKER_COMPOSE_FILE} build"
            }
        }

        stage('Start Services') {
            steps {
                echo 'Starting Postgres, Backend, and Frontend services...'
                sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
            }
        }

        stage('Run Backend Tests (Optional)') {
            steps {
                echo 'Running backend tests inside container (optional)...'
                // Uncomment and customize this if you have tests to run inside backend container
                // sh "docker exec backend mvn test"
            }
        }

        stage('Wait and Health Check') {
            steps {
                echo 'Waiting for services to start...'
                sh 'sleep 15'
                // Add health checks if you want, for example:
                // sh "curl --fail http://localhost:8080/actuator/health"
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful! Backend at http://localhost:8080, Frontend at http://localhost:3000'
        }
        failure {
            echo '❌ Deployment failed. Please check the Jenkins logs.'
        }
        always {
            echo 'Pipeline finished.'
            // Optional cleanup if you want to stop containers after pipeline ends
            // sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down"
        }
    }
}
