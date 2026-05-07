// ╔═══════════════════════════════════════════════════════╗
// ║         JENKINSFILE - FinTrackr App                  ║
// ║         Beginner Friendly Version                    ║
// ║                                                       ║
// ║  Yeh pipeline automatically yeh kaam karta hai:      ║
// ║  1.  Code download  (GitHub se)                      ║
// ║  2.  Node check     (node/npm version)               ║
// ║  3.  npm install    (packages)                       ║
// ║  4.  Tests          (code sahi hai?)                 ║
// ║  5.  SonarCloud     (code quality)                   ║
// ║  6.  Docker build   (image banao)                    ║
// ║  7.  Trivy check    (trivy version)                  ║
// ║  8.  Trivy scan     (security check)                 ║
// ║  9.  Docker login   (dockerhub)                      ║
// ║  10. Docker push    (image upload)                   ║
// ║  11. Deploy         (app live karo)                  ║
// ║  12. Email          (success/fail batao)             ║
// ╚═══════════════════════════════════════════════════════╝

pipeline {

    // Kisi bhi Jenkins machine pe chalo
    agent any

    // ═══════════════════════════════════════════════════
    // VARIABLES - poori pipeline mein use honge
    // ═══════════════════════════════════════════════════
    environment {

        // App ka naam
        APP_NAME = "fintrackr"

        // DockerHub pe image ka naam
        // Format: "dockerhub_username/app_naam"
        DOCKER_IMAGE = "suman2304/fintrackr"

        // Image ka version - BUILD_NUMBER Jenkins deta hai (1,2,3...)
        DOCKER_TAG = "v${BUILD_NUMBER}"

        // SonarCloud project details
        SONAR_PROJECT = "suman023_fintracker"
        SONAR_ORG     = "suman023"

        // Notification email
        EMAIL_TO = "sumanshit023@gmail.com"

        // System path - node/npm dhundhne ke liye
        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"
    }

    // ═══════════════════════════════════════════════════
    // OPTIONS - pipeline ki settings
    // ═══════════════════════════════════════════════════
    options {
        // Logs mein time dikhao
        timestamps()

        // Ek saath 2 builds mat chalao
        disableConcurrentBuilds()

        // Sirf last 10 builds rakho (disk bachao)
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    // ═══════════════════════════════════════════════════
    // STAGES - pipeline ke steps
    // ═══════════════════════════════════════════════════
    stages {

        // ─────────────────────────────────────────────
        // STEP 1 - GitHub se code download karo
        // ─────────────────────────────────────────────
        stage('1 - Code Download') {
            steps {
                echo '>>> STEP 1: Code download ho raha hai...'

                // Jenkins job mein configure ki hui
                // GitHub repo se code clone karo
                checkout scm

                echo '>>> STEP 1: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 2 - Check karo node aur npm hai ya nahi
        // ─────────────────────────────────────────────
        stage('2 - Verify NodeJS') {
            steps {
                echo '>>> STEP 2: NodeJS check ho raha hai...'

                sh '''
                    which node
                    node -v
                    npm -v
                '''

                echo '>>> STEP 2: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 3 - npm install karo
        // ─────────────────────────────────────────────
        stage('3 - Install Packages') {
            steps {
                echo '>>> STEP 3: npm install chal raha hai...'

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
        // STEP 4 - Tests chalao
        // Code sahi kaam kar raha hai? Check karo
        // ─────────────────────────────────────────────
        stage('4 - Run Tests') {
            steps {
                echo '>>> STEP 4: Tests chal rahe hain...'

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
        // Code mein bugs/problems dhundho
        // Results: https://sonarcloud.io/organizations/suman023
        // ─────────────────────────────────────────────
        stage('5 - SonarCloud Scan') {
            steps {
                echo '>>> STEP 5: SonarCloud scan chal raha hai...'

                // 'SonarCloud' = Jenkins mein configure kiya hua naam
                // Manage Jenkins → Configure System → SonarQube Servers
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
        // STEP 6 - Docker Image Banao
        // App ko Docker container mein pack karo
        // ─────────────────────────────────────────────
        stage('6 - Docker Build') {
            steps {
                echo '>>> STEP 6: Docker image ban rahi hai...'

                // Dockerfile se image banao
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."

                // Same image ko latest bhi tag karo
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"

                echo ">>> STEP 6: Done! Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ─────────────────────────────────────────────
        // STEP 7 - Trivy Version Check
        // Verify karo Trivy install hai
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
        // Docker image mein koi vulnerability toh nahi?
        // Jaise antivirus scan karta hai waise
        // Report trivy-reports/trivy-report.html mein
        // ─────────────────────────────────────────────
        stage('8 - Trivy Security Scan') {
            steps {
                echo '>>> STEP 8: Security scan ho raha hai...'

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
                    // HTML report Jenkins mein save karo
                    // Jenkins job → Artifacts mein dikhega
                    archiveArtifacts artifacts: 'trivy-reports/trivy-report.html',
                                     fingerprint: true
                }
            }
        }

        // ─────────────────────────────────────────────
        // STEP 9 - DockerHub Login
        // Image push karne se pehle login karo
        // Credentials: Manage Jenkins → Credentials
        //   ID: dockerhub-credentials
        // ─────────────────────────────────────────────
        stage('9 - Docker Login') {
            steps {
                echo '>>> STEP 9: DockerHub login ho raha hai...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    // Securely login karo
                    // Password kabhi logs mein nahi dikhega
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }

                echo '>>> STEP 9: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 10 - Docker Push
        // Image DockerHub pe upload karo
        // Link: https://hub.docker.com/r/suman2304/fintrackr
        // ─────────────────────────────────────────────
        stage('10 - Docker Push') {
            steps {
                echo '>>> STEP 10: Image DockerHub pe push ho rahi hai...'

                // Version tag wali image push karo
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"

                // Latest tag bhi push karo
                sh "docker push ${DOCKER_IMAGE}:latest"

                echo '>>> STEP 10: Done!'
            }
        }

        // ─────────────────────────────────────────────
        // STEP 11 - Deploy
        // Docker Compose se app live karo
        // ─────────────────────────────────────────────
        stage('11 - Deploy') {
            steps {
                echo '>>> STEP 11: App deploy ho rahi hai...'

                sh '''
                    # Purane containers band karo
                    docker compose down || true

                    # Nayi image se start karo
                    docker compose up -d --build

                    # 15 second wait karo start hone ke liye
                    sleep 15

                    # Status dekho
                    docker compose ps
                '''

                echo '>>> STEP 11: Done! App: http://localhost:3000'
            }
        }

    } // stages end

    // ═══════════════════════════════════════════════════
    // POST ACTIONS
    // Pipeline khatam hone ke baad chalega
    // ═══════════════════════════════════════════════════
    post {

        // Hamesha chalega - success ho ya fail
        always {
            echo '>>> Cleanup ho raha hai...'
            sh 'docker logout || true'
            cleanWs()
        }

        // Sirf success hone par
        success {
            echo '🎉 BUILD SUCCESSFUL!'

            // Email bhejo - success
            // SMTP configure karo:
            // Manage Jenkins → Configure System → Extended Email
            // SMTP: smtp.gmail.com, Port: 465, SSL: on
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

        // Sirf fail hone par
        failure {
            echo '❌ BUILD FAILED!'

            // Email bhejo - failure
            mail(
                to: "${EMAIL_TO}",
                subject: "❌ FAILED: FinTrackr Build #${env.BUILD_NUMBER}",
                body: """
Build Failed! ❌

Project   : ${env.JOB_NAME}
Build No  : #${env.BUILD_NUMBER}
Error Log : ${env.BUILD_URL}console

Jaldi check karo!
                """
            )
        }

    } // post end

} // pipeline end
