// ╔═══════════════════════════════════════════════════════╗
// ║         JENKINSFILE - FinTrackr App                   ║
// ║                                                       ║
// ║  1.  Code download  (GitHub)                          ║
// ║  2.  Node check     (node/npm version)                ║
// ║  3.  npm install    (packages)                        ║
// ║  4.  Tests          (code checking?)                  ║
// ║  5.  SonarCloud     (code quality)                    ║
// ║  6.  Docker build   (image)                           ║
// ║  7.  Trivy check    (trivy version)                   ║
// ║  8.  Trivy scan     (security check)                  ║
// ║  9.  Docker login   (dockerhub)                       ║
// ║  10. Docker push    (image upload)                    ║
// ║  11. Deploy         (app live)                        ║
// ║  12. Email          (success/fail)                    ║
// ╚═══════════════════════════════════════════════════════╝

pipeline {

   
    agent any

    // ═══════════════════════════════════════════════════
    // VARIABLES 
    // ═══════════════════════════════════════════════════
    environment {

        // App name
        APP_NAME = "fintrackr"

        // DockerHub image name
        // Format: "dockerhub_username/app_naam"
        DOCKER_IMAGE = "suman2304/fintrackr"

        // Image version - BUILD_NUMBER  (1,2,3...)
        DOCKER_TAG = "v${BUILD_NUMBER}"

        // SonarCloud project details
        SONAR_PROJECT = "suman023_fintracker"
        SONAR_ORG     = "suman023"

        // Notification email
        EMAIL_TO = "sumanshit023@gmail.com"

        // System path - node/npm 
        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"
    }

    // ═══════════════════════════════════════════════════
    // OPTIONS - pipeline settings
    // ═══════════════════════════════════════════════════
    options {
        // Logs time 
        timestamps()


        disableConcurrentBuilds()

       
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    // ═══════════════════════════════════════════════════
    // STAGES - pipeline steps
    // ═══════════════════════════════════════════════════
    stages {

        // ─────────────────────────────────────────────
        // STEP 1 - GitHub code download 
        // ─────────────────────────────────────────────
        stage('1 - Code Download') {
            steps {
                echo '>>> STEP 1: Code download ...'

                
                checkout scm

                echo '>>> STEP 1: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 2 - Check node and npm 
        // ─────────────────────────────────────────────
        stage('2 - Verify NodeJS') {
            steps {
                echo '>>> STEP 2: NodeJS check ...'

                sh '''
                    which node
                    node -v
                    npm -v
                '''

                echo '>>> STEP 2: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 3 - npm install 
        // ─────────────────────────────────────────────
        stage('3 - Install Packages') {
            steps {
                echo '>>> STEP 3: npm installing ...'

                dir('backend') {
                    sh '''
                        
                        npm install

                        chmod -R +x node_modules/.bin || true
                    '''
                }

                echo '>>> STEP 3: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 4 - Tests 
        // ─────────────────────────────────────────────
        stage('4 - Run Tests') {
            steps {
                echo '>>> STEP 4: Tests code...'

                dir('backend') {
                    sh '''
                        chmod -R +x node_modules/.bin || true

                        NODE_ENV=test npx jest --coverage --forceExit
                    '''
                }

                echo '>>> STEP 4: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 5 - SonarCloud Scan
        // Results: https://sonarcloud.io/organizations/suman023
        // ─────────────────────────────────────────────
        stage('5 - SonarCloud Scan') {
            steps {
                echo '>>> STEP 5: SonarCloud scanning ...'

                
                withSonarQubeEnv('SonarCloud') {
                    sh """
                        npx sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT} \
                        -Dsonar.organization=${SONAR_ORG} \
                        -Dsonar.sources=backend \
                        -Dsonar.tests=backend \
                        -Dsonar.test.inclusions=**/*.test.js \
                        -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/package-lock.json \
                        -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \
                        -Dsonar.host.url=https://sonarcloud.io
                    """
                }

                echo '>>> STEP 5: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 6 - Docker Image 
        // ─────────────────────────────────────────────
        stage('6 - Docker Build') {
            steps {
                echo '>>> STEP 6: Docker image...'

                // Dockerfile To image
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."

                // tagging
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"

                echo ">>> STEP 6: Done! Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ─────────────────────────────────────────────
        // STEP 7 - Trivy Version Check
        // 
        // ─────────────────────────────────────────────
        stage('7 - Verify Trivy') {
            steps {
                echo '>>> STEP 7: Trivy version check...'

                sh 'trivy --version'

                echo '>>> STEP 7: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 8 - Trivy Security Scan
        // Report trivy-reports/trivy-report.html
        // ─────────────────────────────────────────────
        stage('8 - Trivy Security Scan') {
            steps {
                echo '>>> STEP 8: Security scanning...'

                sh '''
                    mkdir -p trivy-reports

                    if [ ! -f /usr/local/share/trivy/templates/html.tpl ]; then
                        sudo mkdir -p /usr/local/share/trivy/templates
                        sudo wget \
                        https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl \
                        -O /usr/local/share/trivy/templates/html.tpl
                    fi

                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format template \
                    --template "@/usr/local/share/trivy/templates/html.tpl" \
                    -o trivy-reports/trivy-report.html \
                    ${DOCKER_IMAGE}:latest
                '''

                echo '>>> STEP 8: Done!'
            }

            post {
                always {
                    // HTML report Jenkins save
                    // Jenkins job → Artifacts 
                    archiveArtifacts artifacts: 'trivy-reports/trivy-report.html',
                                     fingerprint: true
                }
            }
        }

        // ─────────────────────────────────────────────
        // STEP 9 - DockerHub Login
        // Credentials: Manage Jenkins → Credentials
        //   ID: dockerhub-credentials
        // ─────────────────────────────────────────────
        stage('9 - Docker Login') {
            steps {
                echo '>>> STEP 9: DockerHub login...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }

                echo '>>> STEP 9: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 10 - Docker Push
        // ─────────────────────────────────────────────
        stage('10 - Docker Push') {
            steps {
                echo '>>> STEP 10: Image DockerHub Push...'

                // Version tag 
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"

                // Latest tag 
                sh "docker push ${DOCKER_IMAGE}:latest"

                echo '>>> STEP 10: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 11 - Deploy
        // Docker Compose 
        // ─────────────────────────────────────────────
        stage('11 - Deploy') {
            steps {
                echo '>>> STEP 11: App deploy ...'

                sh '''
                    
                    docker compose down || true

                    
                    docker compose up -d --build

                    
                    sleep 15

                    
                    docker compose ps
                '''

                echo '>>> STEP 11: Done! App: http://localhost:3000'
            }
        }

    } 

    // ═══════════════════════════════════════════════════
    // POST ACTIONS
    // ═══════════════════════════════════════════════════
    post {

        
        always {
            echo '>>> Cleanup...'
            sh 'docker logout || true'
            cleanWs()
        }

        
        success {
            echo '🎉 BUILD SUCCESSFUL!'

            
            mail(
                to: "${EMAIL_TO}",
                subject: "✅ SUCCESS: FinTrackr Build #${env.BUILD_NUMBER}",
                body: """
Build Successful! 🎉

Project   : ${env.JOB_NAME}
Build No  : #${env.BUILD_NUMBER}
Image     : ${DOCKER_IMAGE}:${DOCKER_TAG}
App URL   : http://localhost:3000
Build URL : ${env.BUILD_URL}

SonarCloud : https://sonarcloud.io/organizations/suman023
DockerHub  : https://hub.docker.com/r/suman2304/fintrackr
                """
            )
        }

      
        failure {
            echo '❌ BUILD FAILED!'

           
            mail(
                to: "${EMAIL_TO}",
                subject: "❌ FAILED: FinTrackr Build #${env.BUILD_NUMBER}",
                body: """
Build Failed! ❌

Project   : ${env.JOB_NAME}
Build No  : #${env.BUILD_NUMBER}
Error Log : ${env.BUILD_URL}console

Please check!
                """
            )
        }

    } 
} 
