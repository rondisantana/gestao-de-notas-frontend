/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";

// =========================================================
// ******************* CORREÇÃO CRÍTICA ********************
// URL base da API do Back-End implantado no Render.
// O endereço deve ser o URL público do Render.
// =========================================================
const RENDER_BASE_URL = "https://gestao-de-notas-api.onrender.com";
const API_URL = `${RENDER_BASE_URL}/api/alunos`;

// =========================================================
// COMPONENTE SECUNDÁRIO: NotaDisplay (ATUALIZADO PARA DISCIPLINAS)
// Recebe funções para as novas operações: Adicionar Disciplina, Lançar Nota, Editar Nota.
// =========================================================
function NotaDisplay({
  aluno,
  onDeleteAluno,
  onAddDisciplina,
  onLancarNota,
  onEditarNota,
}) {
  // FUNÇÃO AUXILIAR: Calcula a média de notas de UMA ÚNICA disciplina
  const calcularMediaDisciplina = (notas) => {
    if (!notas || notas.length === 0) return 0;
    const soma = notas.reduce((acc, nota) => acc + nota, 0);
    return (soma / notas.length).toFixed(2);
  };

  // NOVO: Calcula a média GERAL de todas as disciplinas
  const calcularMediaGeral = () => {
    if (!aluno.disciplinas || aluno.disciplinas.length === 0) return 0;

    let totalNotas = 0;
    let contagemNotas = 0;

    aluno.disciplinas.forEach((disciplina) => {
      disciplina.notas.forEach((nota) => {
        totalNotas += nota;
        contagemNotas++;
      });
    });

    if (contagemNotas === 0) return 0;
    return (totalNotas / contagemNotas).toFixed(2);
  };

  const mediaGeral = calcularMediaGeral();

  // Renderização do componente
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px 0",
        borderRadius: "8px",
        textAlign: "left",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CABEÇALHO DO ALUNO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, color: "#333" }}>Aluno: {aluno.nome}</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <strong
            style={{
              color: mediaGeral >= 7 ? "#28a745" : "#dc3545",
              fontSize: "1.1em",
            }}
          >
            Média Geral: {mediaGeral}
          </strong>
          {/* Botão de Excluir */}
          <button
            aria-label={`Excluir aluno ${aluno.nome}`}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
            onClick={() => onDeleteAluno(aluno.id, aluno.nome)}
          >
            Excluir
          </button>
        </div>
      </div>

      {/* SEÇÃO DE DISCIPLINAS E NOTAS */}
      <h4 style={{ margin: "5px 0 10px 0", color: "#555" }}>Disciplinas:</h4>

      {aluno.disciplinas && aluno.disciplinas.length > 0 ? (
        aluno.disciplinas.map((disc, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h5 style={{ margin: 0, color: "#333" }}>
                {disc.nome}
                <span
                  style={{
                    marginLeft: "10px",
                    fontWeight: "normal",
                    fontSize: "0.9em",
                    color: "#666",
                  }}
                >
                  (Média: {calcularMediaDisciplina(disc.notas)})
                </span>
              </h5>
              {/* Botão para Lançar Nota */}
              <button
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  backgroundColor: "#007bff", // Azul
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
                onClick={() => onLancarNota(aluno.id, disc.nome)}
              >
                + Nota
              </button>
            </div>

            <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
              Notas:
              {disc.notas && disc.notas.length > 0
                ? disc.notas.map((n, nIndex) => (
                    <span key={nIndex} style={{ marginRight: "5px" }}>
                      {n}
                      {/* Botão para Editar Nota (Com implementação futura!) */}
                      <span
                        title="Editar Nota"
                        style={{
                          cursor: "pointer",
                          color: "#ffc107", // Amarelo
                          marginLeft: "2px",
                          fontSize: "0.9em",
                        }}
                        onClick={() =>
                          onEditarNota(aluno.id, disc.nome, nIndex, n)
                        }
                      >
                        {" "}
                        ✏️
                      </span>
                      {nIndex < disc.notas.length - 1 ? ", " : ""}
                    </span>
                  ))
                : " Nenhuma nota registrada."}
            </p>
          </div>
        ))
      ) : (
        <p style={{ fontStyle: "italic", color: "#999" }}>
          Nenhuma disciplina cadastrada.
        </p>
      )}

      {/* FORMULÁRIO PARA ADICIONAR DISCIPLINA */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "1px dashed #eee",
        }}
      >
        <button
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: "#17a2b8", // Azul ciano
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
          onClick={() => onAddDisciplina(aluno.id, aluno.nome)}
        >
          + Adicionar Nova Disciplina
        </button>
      </div>
    </div>
  );
}

// =========================================================
// COMPONENTE PRINCIPAL: App
// =========================================================
function App() {
  const [alunos, setAlunos] = useState([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Função para buscar dados da API (GET) ---
  const fetchAlunos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      // Aqui, garantimos que a propriedade 'disciplinas' exista, para evitar erros no frontend
      const alunosData = response.data.map((aluno) => ({
        ...aluno,
        disciplinas: aluno.disciplinas || [],
      }));
      setAlunos(alunosData);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
      setError(
        `Erro ao conectar com o servidor Node.js. Verifique se o backend em ${RENDER_BASE_URL} está rodando.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Carrega os alunos ao iniciar o componente
  useEffect(() => {
    fetchAlunos();
  }, []);

  // --- Função para adicionar um novo aluno (POST) ---
  const adicionarAluno = async () => {
    const nomeLimpo = nome.trim();

    if (nomeLimpo) {
      try {
        // O novo aluno deve ter 'disciplinas: []'
        const novoAluno = { nome: nomeLimpo, disciplinas: [] };
        const response = await axios.post(API_URL, novoAluno);

        // Atualiza a lista local com o aluno retornado pela API
        setAlunos([...alunos, response.data]);
        setNome("");
        alert(`Aluno(a) ${nomeLimpo} adicionado(a) com sucesso!`);
      } catch (error) {
        alert("Erro ao adicionar aluno. Verifique o console.");
        console.error("Erro POST:", error);
      }
    } else {
      alert("O nome do aluno não pode ser vazio.");
    }
  };

  // =========================================================
  // NOVAS FUNÇÕES DA AULA 8
  // =========================================================

  // --- 1. Função para adicionar disciplina (POST) ---
  const adicionarDisciplina = async (alunoId, alunoNome) => {
    const nomeDisciplina = prompt(
      `Digite o nome da nova disciplina para ${alunoNome}:`
    );

    if (!nomeDisciplina || nomeDisciplina.trim() === "") {
      if (nomeDisciplina !== null) {
        alert("O nome da disciplina não pode ser vazio.");
      }
      return;
    }

    try {
      const url = `${API_URL}/${alunoId}/disciplinas`;
      const response = await axios.post(url, { nome: nomeDisciplina.trim() });

      // A API do Back-End retorna o aluno COMPLETO, então mapeamos para atualizar
      setAlunos(
        alunos.map((aluno) => (aluno.id === alunoId ? response.data : aluno))
      );

      alert(
        `Disciplina "${nomeDisciplina.trim()}" adicionada para ${alunoNome}.`
      );
    } catch (error) {
      alert(
        `Erro ao adicionar disciplina. Detalhes: ${
          error.response?.data || error.message
        }`
      );
      console.error("Erro POST disciplina:", error);
    }
  };

  // --- 2. Função para lançar nota (POST) ---
  const lancarNota = async (alunoId, disciplinaNome) => {
    const notaInput = prompt(
      `Digite a nova nota para ${disciplinaNome}: (0 a 10)`
    );
    const novaNota = parseFloat(notaInput);

    // Validação de nota
    if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
      if (notaInput !== null) {
        alert("Nota inválida. Digite um número entre 0 e 10.");
      }
      return;
    }

    try {
      // A URL usa ENCODE URI para lidar com nomes de disciplina com espaços ou caracteres especiais
      const url = `${API_URL}/${alunoId}/disciplinas/${encodeURIComponent(
        disciplinaNome
      )}/notas`;
      const response = await axios.post(url, { nota: novaNota });

      // A API do Back-End retorna o aluno COMPLETO, então mapeamos para atualizar
      setAlunos(
        alunos.map((aluno) => (aluno.id === alunoId ? response.data : aluno))
      );

      alert(`Nota ${novaNota} lançada para ${disciplinaNome}.`);
    } catch (error) {
      alert(
        `Erro ao lançar nota. Detalhes: ${
          error.response?.data || error.message
        }`
      );
      console.error("Erro POST nota:", error);
    }
  };

  // --- 3. Função para editar nota (PUT) ---
  const editarNota = async (alunoId, disciplinaNome, notaIndex, notaAtual) => {
    const novaNotaInput = prompt(
      `Nova nota para ${disciplinaNome} (Atual: ${notaAtual}): (0 a 10)`
    );
    const novaNota = parseFloat(novaNotaInput);

    if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
      if (novaNotaInput !== null) {
        alert("Nota inválida. Digite um número entre 0 e 10.");
      }
      return;
    }

    try {
      const url = `${API_URL}/${alunoId}/disciplinas/${encodeURIComponent(
        disciplinaNome
      )}/notas/${notaIndex}`;
      const response = await axios.put(url, { novaNota: novaNota });

      // A API do Back-End retorna o aluno COMPLETO, então mapeamos para atualizar
      setAlunos(
        alunos.map((aluno) => (aluno.id === alunoId ? response.data : aluno))
      );

      alert(`Nota alterada com sucesso para ${novaNota}.`);
    } catch (error) {
      alert(
        `Erro ao editar nota. Detalhes: ${
          error.response?.data || error.message
        }`
      );
      console.error("Erro PUT nota:", error);
    }
  };
  // =========================================================

  // --- Função para excluir aluno (DELETE) ---
  const excluirAluno = async (alunoId, alunoNome) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o aluno(a) ${alunoNome}?`)
    ) {
      return;
    }

    try {
      const url = `${API_URL}/${alunoId}`;
      await axios.delete(url); // Remove o aluno da lista local

      setAlunos(alunos.filter((aluno) => aluno.id !== alunoId));
      alert(`Aluno(a) ${alunoNome} excluído(a) com sucesso!`);
    } catch (error) {
      alert("Erro ao excluir aluno. Verifique o console.");
      console.error("Erro DELETE:", error);
    }
  };

  // --- Renderização Principal ---
  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#eee",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{ color: "#333", textAlign: "center", marginBottom: "30px" }}
        >
          Gestão de Notas (React + Node API)
        </h1>

        {/* Seção de Adicionar Novo Aluno */}
        <div
          style={{
            marginBottom: "25px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            aria-label="Nome do aluno"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do novo aluno"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              minWidth: "200px",
              flex: "1 1 50%",
            }}
          />
          <button
            onClick={adicionarAluno}
            aria-label="Adicionar novo aluno"
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
          >
            Adicionar Aluno
          </button>
        </div>

        {/* --- Exibição de Alunos e Feedback --- */}
        <div style={{ textAlign: "center" }}>
          <h2>Detalhes e Média dos Alunos ({alunos.length} total)</h2>

          {/* Tratamento de Loading */}
          {loading && (
            <p style={{ color: "#007bff" }}>Carregando dados do servidor...</p>
          )}

          {/* Tratamento de Erro de Conexão */}
          {error && (
            <div
              style={{
                color: "#dc3545",
                padding: "15px",
                border: "1px solid #dc3545",
                borderRadius: "5px",
                marginBottom: "15px",
              }}
            >
              <p>{error}</p>
              <button
                onClick={fetchAlunos}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Tentar Reconexão
              </button>
            </div>
          )}

          {/* Lista de Alunos */}
          {!loading && !error && alunos.length === 0 && (
            <p>Nenhum aluno adicionado ainda.</p>
          )}

          {!loading &&
            alunos.map((aluno) => (
              <NotaDisplay
                key={aluno.id}
                aluno={aluno}
                onAddDisciplina={adicionarDisciplina}
                onLancarNota={lancarNota}
                onDeleteAluno={excluirAluno}
                onEditarNota={editarNota}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
