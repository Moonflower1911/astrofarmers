pipeline {
    agent any

    environment {
        // Adjust if your directory names are different in Jenkins workspace
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
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
                // Use docker-compose to build images according to your docker-compose.yml
                sh 'docker-compose build'
            }
        }

        stage('Start Services') {
            steps {
                echo 'Starting all services (Postgres, Backend, Frontend, Jenkins)...'
                sh 'docker-compose up -d'
            }
        }

        stage('Run Backend Tests (Optional)') {
            steps {
                echo 'You can add test execution steps here if needed.'
                // For example, run backend tests in the container if needed
                // sh "docker exec backend mvn test"
            }
        }

        stage('Wait and Check') {
            steps {
                echo 'Waiting for services to start...'
                // Wait a few seconds to let services stabilize
                sh 'sleep 15'
                // You can add health check scripts here if needed
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
        }
    }
}
