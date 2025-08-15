import os
import couchdb
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from dotenv import load_dotenv
from urllib.parse import quote

estados_bp = Blueprint('estados', __name__)

load_dotenv()  # take environment variables

db_password = os.getenv("SENHA")
db_ip = os.getenv("IP")
db_user = os.getenv("USUARIO", "admin") # Usa 'admin' como padrão se não for definido
DB_NAME = 'ranking-nacional'

# alida se as variáveis essenciais foram definidas no seu arquivo .env
if not all([db_password, db_ip, db_user]):
    raise ValueError("As variáveis de ambiente SENHA, IP, e USUARIO devem ser definidas.")

# --- 3. Estabelecer Conexão com o Servidor (Apenas uma vez) ---
server = None
try:
    # Codifica a senha e monta a URL de conexão
    encoded_password = quote(db_password)
    couchdb_url = f'http://{db_user}:{encoded_password}@{db_ip}'
    
    # Conecta ao servidor
    server = couchdb.Server(couchdb_url)
    
    # Confirma que a conexão é válida
    server.version()
    print(f"Conexão com o servidor CouchDB em '{db_ip}' estabelecida com sucesso.")

except Exception as e:
    # Se a conexão inicial falhar, imprime um erro crítico.
    print(f"ERRO CRÍTICO: Não foi possível conectar ao servidor CouchDB. {e}")
    # 'server' permanecerá como None, e a função get_db() irá falhar.


# --- 4. Função para Obter o Banco de Dados ---
def get_db():
    """
    Obtém o banco de dados 'ranking-nacional' a partir da conexão existente.
    Cria o banco de dados se ele não existir.

    Raises:
        ConnectionError: Se a conexão com o servidor não foi estabelecida.

    Returns:
        couchdb.Database: O objeto do banco de dados.
    """
    # Verifica se a conexão global foi bem-sucedida
    if server is None:
        raise ConnectionError("A conexão com o servidor CouchDB não foi estabelecida.")

    try:
        # Seleciona o banco de dados ou o cria se não existir
        if DB_NAME in server:
            db = server[DB_NAME]
        else:
            print(f"Criando banco de dados '{DB_NAME}'...")
            db = server.create(DB_NAME)
        
        return db
    except Exception as e:
        # Lança um erro que pode ser capturado pelas rotas do Flask
        raise ConnectionError(f"Não foi possível acessar o banco de dados '{DB_NAME}': {e}")

# --- Data Access Functions (Refactored) ---
def get_available_periods():
    """Retorna os períodos disponíveis baseados nos documentos do CouchDB"""
    db = get_db()
    periods = []
    
    # Itera sobre todos os documentos no banco de dados
    for doc_id in db:
        # Assumindo formato de ID: mes-ano (ex: junho-2025)
        parts = doc_id.split('-')
        if len(parts) == 2:
            mes, ano = parts
            periods.append({
                'mes': mes,
                'ano': ano,
                'doc_id': doc_id # Usado internamente se necessário
            })
            
    return periods

def load_document(doc_id):
    """Carrega dados de um documento específico do CouchDB"""
    db = get_db()
    try:
        doc = db[doc_id]
        # Remove os campos internos do CouchDB (_id, _rev) para uma resposta limpa
        return {key: value for key, value in doc.items() if not key.startswith('_')}
    except couchdb.http.ResourceNotFound:
        return None # Documento não encontrado
    except Exception:
        return None # Outros erros de decodificação ou conexão

# --- API Endpoints (Updated) ---

@estados_bp.route('/api/periodos', methods=['GET'])
@cross_origin()
def get_periodos():
    """Retorna todos os períodos disponíveis"""
    try:
        periods = get_available_periods()
        
        # Organizar por ano e mês (lógica idêntica à original)
        anos = {}
        for period in periods:
            ano = period['ano']
            mes = period['mes']
            
            if ano not in anos:
                anos[ano] = []
            
            anos[ano].append({
                'mes': mes,
                'filename': f"{mes}-{ano}" # Mantendo a chave 'filename' para consistência com o front-end
            })
        
        return jsonify({
            'success': True,
            'data': anos
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@estados_bp.route('/api/dados/<sigla_estado>', methods=['GET'])
@cross_origin()
def get_dados_estado(sigla_estado):
    """Retorna dados de um estado específico para um período"""
    try:
        mes = request.args.get('mes')
        ano = request.args.get('ano')
        
        if not mes or not ano:
            return jsonify({
                'success': False,
                'error': 'Parâmetros mes e ano são obrigatórios'
            }), 400
        
        # Construir ID do documento no formato mes-ano
        doc_id = f"{mes}-{ano}"
        
        # Carregar dados do CouchDB
        data = load_document(doc_id)
        if data is None:
            return jsonify({
                'success': False,
                'error': 'Dados não encontrados para o período especificado'
            }), 404
        
        # Verificar se o estado existe nos dados
        sigla_upper = sigla_estado.upper()
        if sigla_upper not in data:
            return jsonify({
                'success': False,
                'error': f'Estado {sigla_upper} não encontrado nos dados'
            }), 404
        
        return jsonify({
            'success': True,
            'data': data[sigla_upper]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@estados_bp.route('/api/dados', methods=['GET'])
@cross_origin()
def get_todos_dados():
    """Retorna dados de todos os estados para um período"""
    try:
        mes = request.args.get('mes')
        ano = request.args.get('ano')
        
        if not mes or not ano:
            return jsonify({
                'success': False,
                'error': 'Parâmetros mes e ano são obrigatórios'
            }), 400
        
        # Construir ID do documento
        doc_id = f"{mes}-{ano}"
        
        # Carregar dados do CouchDB
        data = load_document(doc_id)
        if data is None:
            return jsonify({
                'success': False,
                'error': 'Dados não encontrados para o período especificado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500