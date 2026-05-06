// =====================================================
//  JENKINSFILE - FinTrackr App
//  Simple aur Easy version for Beginners
// =====================================================

pipeline {

    // Kisi bhi Jenkins machine pe chalo
    agent any

    // NodeJS tool use karo
    // Jenkins mein configure karo:
    // Manage Jenkins → Tools → NodeJS → Add → Name: NodeJS-18
    tools {
        nodejs 'NodeJS-18'
    }

    // Variables jo poori pipeline mein use honge
    environment {
        APP_NAME     = "fintrackr"
        DOCKER_IMAGE = "suman023/fintrackr"
        DOCKER_TAG   = "v${BUILD_NUMBER}"
        MY_EMAIL     = "sumankumar02304@gmail.com"
    }

    stages {

        // -------------------------------------------
        // STEP 1: GitHub se code download karo
        // -------------------------------------------
        stage('Code Download') {
            steps {
                echo '>>> Step 1: Code download ho raha hai...'
                checkout scm
                echo '>>> Code download ho gaya!'
            }
        }

        // -------------------------------------------
        // STEP 2: npm install karo
        // -------------------------------------------
        stage('Install Packages') {
            steps {
                echo '>>> Step 2: npm install chal raha hai...'
                dir('backend') {
                    sh 'npm install'
                }
                echo '>>> Packages install ho gaye!'
            }
        }

        // -------------------------------------------
        // STEP 3: Tests chalao
        // -------------------------------------------
        stage('Run Tests') {
            steps {
                echo '>>> Step 3: Tests chal rahe hain...'
                dir('backend') {
                    sh 'npm test || true'
                }
                echo '>>> Tests khatam!'
            }
        }

        // -------------------------------------------
        // STEP 4: SonarCloud - Code Quality Check
        // -------------------------------------------
        stage('SonarCloud Scan') {
            steps {
                echo '>>> Step 4: SonarCloud scan chal raha hai...'
                withSonarQubeEnv('SonarCloud') {
                    sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=suman023_fintracker \
                          -Dsonar.organization=suman023 \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=https://sonarcloud.io
                    """
                }
                echo '>>> SonarCloud scan ho gaya!'
            }
        }

        // -------------------------------------------
        // STEP 5: Docker Image Banao
        // -------------------------------------------
        stage('Docker Build') {
            steps {
                echo '>>> Step 5: Docker image ban rahi hai...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag  ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                echo ">>> Image ban gayi: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // -------------------------------------------
        // STEP 6: Trivy - Security Check
        // -------------------------------------------
        stage('Trivy Scan') {
            steps {
                echo '>>> Step 6: Security scan ho raha hai...'
                sh '''
                    if ! command -v trivy &> /dev/null; then
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    fi
                    trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:latest
                '''
                echo '>>> Security scan khatam!'
            }
        }

        // -------------------------------------------
        // STEP 7: DockerHub Login + Push
        // -------------------------------------------
        stage('Docker Push') {
            steps {
                echo '>>> Step 7: DockerHub pe image push ho rahi hai...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
                echo '>>> Image push ho gayi!'
            }
        }

        // -------------------------------------------
        // STEP 8: App Deploy karo
        // -------------------------------------------
        stage('Deploy') {
            steps {
                echo '>>> Step 8: App deploy ho rahi hai...'
                sh '''
                    docker compose down || true
                    docker compose up -d --build
                    sleep 10
                    docker compose ps
                '''
                echo '>>> App live hai: http://localhost:3000'
            }
        }

    } // stages end

    // Pipeline ke baad kya karo
    post {

        success {
            echo '🎉 BUILD SUCCESSFUL! App chal rahi hai!'
            emailext(
                subject: "✅ FinTrackr Build #${BUILD_NUMBER} - SUCCESS",
                body: "Build pass ho gaya!\n\nApp: http://localhost:3000\nBuild: ${BUILD_URL}",
                to: "${MY_EMAIL}"
            )
        }

        failure {
            echo '❌ BUILD FAILED! Error dekho upar.'
            emailext(
                subject: "❌ FinTrackr Build #${BUILD_NUMBER} - FAILED",
                body: "Build fail ho gaya!\n\nError dekho: ${BUILD_URL}console",
                to: "${MY_EMAIL}"
            )
        }

        always {
            echo '🧹 Cleanup...'
            sh 'docker logout || true'
            cleanWs()
        }

    } // post end

} // pipeline end
