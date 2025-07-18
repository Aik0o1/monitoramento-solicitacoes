import json
import os
import glob
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

estados_bp = Blueprint('estados', __name__)

def get_available_periods():
    """Retorna os períodos disponíveis baseados nos arquivos JSON"""
    json_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'json_data')
    json_files = glob.glob(os.path.join(json_dir, '*.json'))
    
    periods = []
    for file_path in json_files:
        filename = os.path.basename(file_path)
        # Assumindo formato: mes_ano.json (ex: junho_2025.json)
        if filename.endswith('.json'):
            name_part = filename[:-5]  # Remove .json
            parts = name_part.split('_')
            if len(parts) == 2:
                mes, ano = parts
                periods.append({
                    'mes': mes,
                    'ano': ano,
                    'filename': filename
                })
    
    return periods

def load_json_data(filename):
    """Carrega dados de um arquivo JSON específico"""
    json_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'json_data')
    file_path = os.path.join(json_dir, filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None

@estados_bp.route('/api/periodos', methods=['GET'])
@cross_origin()
def get_periodos():
    """Retorna todos os períodos disponíveis"""
    try:
        periods = get_available_periods()
        
        # Organizar por ano e mês
        anos = {}
        for period in periods:
            ano = period['ano']
            mes = period['mes']
            
            if ano not in anos:
                anos[ano] = []
            
            anos[ano].append({
                'mes': mes,
                'filename': period['filename']
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
        if mes == "março": mes = "marco"
        
        ano = request.args.get('ano')
        
        if not mes or not ano:
            return jsonify({
                'success': False,
                'error': 'Parâmetros mes e ano são obrigatórios'
            }), 400
        
        # Construir nome do arquivo
        filename = f"{mes}_{ano}.json"
        
        # Carregar dados
        data = load_json_data(filename)
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
        if mes == "março": mes = "marco"
        
        ano = request.args.get('ano')
        
        if not mes or not ano:
            return jsonify({
                'success': False,
                'error': 'Parâmetros mes e ano são obrigatórios'
            }), 400
        
        # Construir nome do arquivo
        filename = f"{mes}_{ano}.json"
        
        # Carregar dados
        data = load_json_data(filename)
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

