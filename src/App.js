import React, { useState, useEffect } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

// Configura o DOMPurify para ser usado no ambiente do navegador
const purify = DOMPurify;

// =========================================================
// COMPONENTE SECUNDÁRIO: NotaDisplay
// =========================================================
function NotaDisplay({ aluno, onAddNota, onDeleteAluno }) {
  // Calcula a soma e a média das notas
  const somaNotas = aluno.notas.reduce((soma, nota) => soma + nota, 0);
  const media =
    aluno.notas.length > 0 ? (somaNotas / aluno.notas.length).toFixed(2) : 0;

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
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flexGrow: 1 }}>
        <h3
          style={{
            marginTop: 0,
            color: "#333",
            display: "inline-block",
            marginRight: "10px",
          }}
        >
          Aluno: {aluno.nome}
        </h3>
        <p style={{ marginBottom: "5px" }}>
          Notas:{" "}
          {aluno.notas.length > 0
            ? aluno.notas.join(", ")
            : "Nenhuma nota registrada."}
        </p>
        <strong style={{ color: media >= 7 ? "#28a745" : "#dc3545" }}>
          Média: {media}
        </strong>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        {/* Botão para adicionar nota */}
        <button
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
          onClick={() => onAddNota(aluno.id, aluno.nome)}
        >
          + Nota
        </button>

        {/* Botão para excluir aluno (Implementação da Rota DELETE) */}
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

  const API_URL = "http://localhost:5000/api/alunos";

  // --- Função para buscar dados da API (GET) ---
  const fetchAlunos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pequeno atraso para garantir que o backend inicie
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response = await axios.get(API_URL);
      setAlunos(response.data);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
      setError(
        "Erro ao conectar com o servidor Node.js (Porta 5000). Verifique se o backend está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  // Carrega os alunos ao iniciar o componente
  useEffect(() => {
    fetchAlunos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependência vazia para rodar apenas uma vez

  // --- Função para adicionar um novo aluno (POST) ---
  const adicionarAluno = async () => {
    const nomeLimpo = purify.sanitize(nome.trim());

    if (nomeLimpo) {
      try {
        const novoAluno = { nome: nomeLimpo, notas: [] };
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

  // --- Função para adicionar nota (PUT) ---
  const adicionarNota = async (alunoId, alunoNome) => {
    const notaInput = prompt(`Digite a nova nota para ${alunoNome}: (0 a 10)`);
    const novaNota = parseFloat(notaInput);

    // Validação de nota no frontend (o backend também valida!)
    if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
      if (notaInput !== null) {
        alert("Nota inválida. Digite um número entre 0 e 10.");
      }
      return;
    }

    try {
      const url = `${API_URL}/${alunoId}/notas`;
      const response = await axios.put(url, { nota: novaNota });

      // Atualiza o aluno na lista local
      setAlunos(
        alunos.map((aluno) => (aluno.id === alunoId ? response.data : aluno))
      );
      alert(`Nota ${novaNota} adicionada para ${alunoNome}.`);
    } catch (error) {
      alert("Erro ao adicionar nota. Verifique o console.");
      console.error("Erro PUT:", error);
    }
  };

  // --- Função para excluir aluno (DELETE) ---
  const excluirAluno = async (alunoId, alunoNome) => {
    if (
      !window.confirm(`Tem certeza que deseja excluir o aluno(a) ${alunoNome}?`)
    ) {
      return;
    }

    try {
      const url = `${API_URL}/${alunoId}`;
      await axios.delete(url);

      // Remove o aluno da lista local
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

        {/* Seção de Adicionar Novo Aluno (Protegida contra XSS e com A11y) */}
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
                onAddNota={adicionarNota}
                onDeleteAluno={excluirAluno}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
