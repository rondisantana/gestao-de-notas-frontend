import { useState, useEffect } from "react";
import axios from "axios";
import createDOMPurify from "dompurify";

// O URL público do seu Back-End no Render
// Este é o único lugar no front-end que precisa saber o endereço da API!
const API_BASE_URL = "https://gestao-de-notas-api.onrender.com/api";

// Configuração do DOMPurify para evitar ataques XSS
const DOMPurify = createDOMPurify(window);

/**
 * Custom Hook para gerenciar o estado e a comunicação com a API de Alunos.
 */
const useAlunosApi = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- FUNÇÃO CENTRAL DE CARREGAMENTO (GET) ---
  const fetchAlunos = async () => {
    setLoading(true);
    setError(false);
    try {
      // Requisição GET para buscar a lista de alunos
      const response = await axios.get(API_BASE_URL);
      setAlunos(response.data);
      setLoading(false);
    } catch (err) {
      console.error(
        "Erro ao carregar alunos. Certifique-se de que o servidor Render está ativo:",
        err
      );
      setError(true);
      setLoading(false);
    }
  };

  // --- EFEITO: CARREGA OS ALUNOS NA INICIALIZAÇÃO ---
  useEffect(() => {
    // Tenta carregar os dados com um pequeno delay para garantir que a API Render esteja "acordada"
    const initialLoad = setTimeout(() => {
      fetchAlunos();
    }, 500); // 500ms de atraso

    return () => clearTimeout(initialLoad);
  }, []);

  // --- FUNÇÕES CRUD ---

  /**
   * Adiciona um novo aluno (POST)
   * @param {string} nome O nome do aluno a ser adicionado.
   */
  const adicionarAluno = async (nome) => {
    const nomeLimpo = DOMPurify.sanitize(nome.trim());

    if (!nomeLimpo) {
      alert("O nome do aluno não pode ser vazio.");
      return;
    }

    try {
      // Requisição POST para criar um novo aluno na API
      const response = await axios.post(API_BASE_URL, {
        nome: nomeLimpo,
        notas: [],
      });

      // Atualiza o estado local com o aluno retornado pela API
      setAlunos([...alunos, response.data]);
      alert(`Aluno(a) ${nomeLimpo} adicionado(a) com sucesso!`);
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      alert("Erro ao adicionar aluno. Tente novamente.");
    }
  };

  /**
   * Adiciona uma nova nota a um aluno (PUT)
   * @param {number} alunoId O ID do aluno a ser atualizado.
   * @param {number} alunoNome O nome do aluno (para o alert).
   */
  const adicionarNota = async (alunoId, alunoNome) => {
    const notaInput = prompt(`Digite a nota para ${alunoNome} (0-10):`);
    const novaNota = parseFloat(notaInput);

    if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
      if (notaInput !== null) {
        // Evita alerta se o usuário clicar em Cancelar
        alert("Nota inválida. Digite um número entre 0 e 10.");
      }
      return;
    }

    try {
      const url = `${API_BASE_URL}/${alunoId}/notas`;

      // Requisição PUT para adicionar a nota na API
      const response = await axios.put(url, { nota: novaNota });

      // Mapeia o estado atual e substitui o aluno antigo pelo aluno atualizado retornado pela API
      setAlunos(alunos.map((a) => (a.id === alunoId ? response.data : a)));
      alert(`Nota ${novaNota} adicionada para ${alunoNome}.`);
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
      alert("Erro ao adicionar nota. Tente novamente.");
    }
  };

  /**
   * Exclui um aluno (DELETE)
   * @param {number} alunoId O ID do aluno a ser excluído.
   * @param {string} alunoNome O nome do aluno (para o alert).
   */
  const excluirAluno = async (alunoId, alunoNome) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o aluno(a) ${alunoNome}?`)
    ) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/${alunoId}`;

      // Requisição DELETE para excluir o aluno na API
      await axios.delete(url);

      // Filtra o estado local para remover o aluno excluído
      setAlunos(alunos.filter((a) => a.id !== alunoId));
      alert(`Aluno(a) ${alunoNome} excluído(a) com sucesso!`);
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      alert("Erro ao excluir aluno. Tente novamente.");
    }
  };

  // Retorna todos os dados e funções que o componente App precisa
  return {
    alunos,
    loading,
    error,
    fetchAlunos, // Permite recarregar se houver erro
    adicionarAluno,
    adicionarNota,
    excluirAluno,
  };
};

export default useAlunosApi;
