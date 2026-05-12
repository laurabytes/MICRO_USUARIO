pipeline {
    agent any

    tools {
        nodejs "node22"
    }
    stages {
        stage('Verificar Repositório') {
            steps {
              
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    useRemoteConfigs: [[url: 'https://github.com/laurabytes/micro_usuario']]
                ])
            }
        }
        stage('Instalar Dependências') {
            steps {
                
                bat 'npm install'
                
                bat 'npx prisma generate'
            }
        }
        stage('Construir Imagem Docker') {
            steps {
                script {
                  
                    env.PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"

                    def appName = 'micro-usuario'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                    bat "docker build -t ${imageTag} ."
                }
            }
        }
        stage('Fazer Deploy') {
            steps {
                script {
                    def appName = 'micro-usuario'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                   
                    bat "docker stop ${appName} || echo 0"
                    bat "docker rm -v ${appName} || echo 0"
                  
                    bat "docker run -d --name ${appName} -p 9501:9501 ${imageTag}"
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