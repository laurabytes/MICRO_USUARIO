pipeline {
    agent any

    stages {
        stage('Verificar Repositório') {
            steps {
                
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    doGenerateSubmoduleConfigurations: false, 
                    extensions: [], 
                    submoduleCfg: [], 
                    userRemoteConfigs: [[url: 'https://github.com/laurabytes/micro_usuario']]
                ])
            }
        }

        stage('Instalar Dependências') {
            steps {

                sh 'npm install'
                sh 'npx prisma generate'
            }
        }

        stage('Construir Imagem Docker') {
            steps {
                script {
                    
                    env.PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"

                    def appName = 'micro-usuario'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                    sh "docker build -t ${imageTag} ."
                }
            }
        }

        stage('Fazer Deploy') {
            steps {
                script {
                    def appName = 'micro-usuario'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                    sh "docker stop ${appName} || echo 0"
                    sh "docker rm -v ${appName} || echo 0"
                
                    sh "docker run -d --name ${appName} -p 9501:9501 ${imageTag}"
                }
            }
        }
    }

    post {
        success {
            echo 'Deploy do micro-usuario realizado com sucesso!'
        }
        failure {
            echo 'Houve um erro durante o deploy do micro-usuario.'
        }
    }
}