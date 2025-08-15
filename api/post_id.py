import os
import json

def adicionar_id_aos_jsons(pasta):
    """
    Lê todos os arquivos JSON em uma pasta, adiciona um campo '_id'
    com o nome do arquivo e salva as alterações.

    Argumentos:
        pasta (str): O caminho para a pasta contendo os arquivos JSON.
    """
    try:
        # Verifica se a pasta existe
        if not os.path.isdir(pasta):
            print(f"Erro: A pasta '{pasta}' não foi encontrada.")
            return

        # Itera por todos os arquivos na pasta
        for nome_arquivo in os.listdir(pasta):
            # Verifica se o arquivo é um JSON
            if nome_arquivo.endswith('.json'):
                caminho_arquivo = os.path.join(pasta, nome_arquivo)
                
                # Extrai o nome do documento sem a extensão .json
                id_documento = os.path.splitext(nome_arquivo)[0]

                try:
                    # Abre e lê o conteúdo do arquivo JSON
                    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
                        dados = json.load(f)

                    # Adiciona o campo "_id" ao dicionário
                    dados['_id'] = id_documento

                    # Abre o mesmo arquivo para escrita (sobrescreve o original)
                    with open(caminho_arquivo, 'w', encoding='utf-8') as f:
                        # Salva o dicionário modificado de volta no arquivo
                        # O argumento ensure_ascii=False garante a codificação correta de caracteres especiais
                        # O argumento indent=2 formata o JSON para melhor legibilidade
                        json.dump(dados, f, ensure_ascii=False, indent=2)
                    
                    print(f"O arquivo '{nome_arquivo}' foi atualizado com sucesso.")

                except json.JSONDecodeError:
                    print(f"Erro: O arquivo '{nome_arquivo}' não é um JSON válido.")
                except Exception as e:
                    print(f"Ocorreu um erro ao processar o arquivo '{nome_arquivo}': {e}")

    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

# Nome da pasta onde os arquivos JSON estão localizados
pasta_json = 'json_data'

# Chama a função para processar os arquivos
adicionar_id_aos_jsons(pasta_json)