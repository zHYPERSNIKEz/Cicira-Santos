import { useState } from 'react'
import { Link } from 'react-router-dom'
// Adicionei o ícone 'Phone' na importação
import { Save, ShoppingBag, UserPlus, MapPin, Trash2, FileText, ArrowLeft, Menu, Calendar, Phone } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { useAluguelForm } from '../../hooks/useAluguelForm'

export default function Formulario() {
  const [menuAberto, setMenuAberto] = useState(false)
  
  const {
    loading, modoEdicao, id,
    dadosCliente, setDadosCliente, termoBusca, handleBuscaCPF, clienteEncontradoNaBusca, ativarNovoCliente, selecionarCliente, modoNovoCliente, handleTelefone, travadoIdentificacao, setModoNovoCliente, setTermoBusca,
    datas, handleMudancaRetirada, setDatas,
    termoProduto, setTermoProduto, produtosEncontrados, verificarDisponibilidadeEAdicionar, carrinho, setCarrinho, modoProdutoManual, setModoProdutoManual, produtoManual, setProdutoManual, adicionarProdutoManual,
    anotacoes, setAnotacoes, pagamento, setPagamento,
    total, valorRestante, finalizarAluguel
  } = useAluguelForm()

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-0">
        <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
        <main className="p-4 md:p-8 md:ml-64 transition-all">
            {/* Header Mobile */}
            <div className="md:hidden flex items-center justify-between mb-4 sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm py-2 px-2 shadow-sm rounded-b-xl">
                <button type="button" onClick={() => setMenuAberto(true)} className="text-gray-700 p-2 bg-white rounded-lg shadow-sm"><Menu size={24} /></button>
                <span className="font-bold text-gray-700">Aluguel Sys</span><div className="w-8"></div>
            </div>

             <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                       <ShoppingBag size={28} className="text-blue-600"/> {id ? 'Editar Aluguel' : 'Novo Aluguel'}
                    </h2>
                    <Link to="/alugueis" className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2 shadow-sm border border-gray-200">
                        <ArrowLeft size={16}/> Voltar
                    </Link>
                </header>

                {loading && <div className="p-8 text-center text-gray-500 animate-pulse">Carregando dados...</div>}
                
                {!loading && (
                     <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 space-y-6">
                        
                            {/* SEÇÃO 1: CLIENTE */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h4 className="font-bold text-gray-700 flex items-center gap-2"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Cliente</h4>
                                
                                {!dadosCliente.id && !modoNovoCliente && (
                                    <div className="relative w-full">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">BUSCAR POR CPF</label>
                                        <input type="text" placeholder="000.000.000-00" className="w-full p-3 border rounded-lg font-mono text-lg outline-none focus:border-blue-500" value={termoBusca} onChange={e => handleBuscaCPF(e.target.value)} autoFocus />
                                        {termoBusca.length === 14 && (<button onClick={ativarNovoCliente} className="mt-3 w-full py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm"><UserPlus size={18}/> Cadastrar Novo Cliente</button>)}
                                        {clienteEncontradoNaBusca && (<div onClick={selecionarCliente} className="mt-2 p-3 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 flex justify-between items-center shadow-sm"><div><div className="font-bold text-green-800">{clienteEncontradoNaBusca.nome}</div><div className="text-xs text-green-700">CPF: {clienteEncontradoNaBusca.cpf}</div></div><span className="text-xs font-bold bg-green-700 text-white px-3 py-1 rounded-full">Selecionar</span></div>)}
                                    </div>
                                )}

                                {(dadosCliente.id || modoNovoCliente) && (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                         <div className="flex justify-end"><button onClick={()=>{setDadosCliente({id:null, nome:'', cpf:'', telefone:'', rua:'', numero:'', bairro:'', cidade:''}); setModoNovoCliente(false); setTermoBusca('')}} className="text-xs text-red-500 hover:text-red-700 font-bold underline">Trocar / Limpar</button></div>
                                         
                                         {/* LINHA 1: NOME (Grande) e CPF (Pequeno) */}
                                         <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                            <div className="md:col-span-8"><label className="text-xs font-bold text-gray-500">NOME</label><input disabled={travadoIdentificacao} value={dadosCliente.nome} onChange={e => setDadosCliente({...dadosCliente, nome: e.target.value})} className={`w-full p-2 border rounded-lg ${travadoIdentificacao ? 'bg-gray-100 text-gray-600' : 'bg-white border-blue-300'}`} placeholder="Nome Completo"/></div>
                                            <div className="md:col-span-4"><label className="text-xs font-bold text-gray-500">CPF</label><input disabled={travadoIdentificacao} value={dadosCliente.cpf} className={`w-full p-2 border rounded-lg font-mono ${travadoIdentificacao ? 'bg-gray-100 text-gray-600' : 'bg-white border-blue-300'}`} readOnly/></div>
                                         </div>

                                         {/* LINHA 2: TELEFONE (Pequeno) e RUA (Grande) - AGORA ALINHADOS E COM ÍCONE */}
                                         <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                             <div className="md:col-span-4"><label className="text-xs font-bold text-gray-500 flex gap-1 items-center"><Phone size={12}/> TELEFONE</label><input value={dadosCliente.telefone} onChange={e => handleTelefone(e.target.value)} className="w-full p-2 border rounded-lg bg-white" placeholder="(00) 00000-0000"/></div>
                                             <div className="md:col-span-8"><label className="text-xs font-bold text-gray-500 flex gap-1 items-center"><MapPin size={12}/> RUA</label><input value={dadosCliente.rua} onChange={e => setDadosCliente({...dadosCliente, rua: e.target.value})} className="w-full p-2 border rounded-lg bg-white" placeholder="Rua / Avenida"/></div>
                                         </div>
                                         
                                         {/* LINHA 3: ENDEREÇO DETALHADO */}
                                         <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                            <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500">NÚMERO</label><input value={dadosCliente.numero} onChange={e => setDadosCliente({...dadosCliente, numero: e.target.value})} className="w-full p-2 border rounded-lg"/></div>
                                            <div className="md:col-span-5"><label className="text-xs font-bold text-gray-500">BAIRRO</label><input value={dadosCliente.bairro} onChange={e => setDadosCliente({...dadosCliente, bairro: e.target.value})} className="w-full p-2 border rounded-lg"/></div>
                                            <div className="md:col-span-4"><label className="text-xs font-bold text-gray-500">CIDADE</label><input value={dadosCliente.cidade} onChange={e => setDadosCliente({...dadosCliente, cidade: e.target.value})} className="w-full p-2 border rounded-lg"/></div>
                                         </div>
                                    </div>
                                )}
                            </div>

                            {/* SEÇÃO 2: DATAS */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1"><label className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><Calendar size={12}/> Retirada</label><input type="date" className="w-full p-3 border rounded-lg font-medium" value={datas.retirada} onChange={handleMudancaRetirada}/></div>
                                <div className="flex-1"><label className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><Calendar size={12}/> Devolução</label><input type="date" className="w-full p-3 border rounded-lg font-medium" value={datas.devolucao} onChange={e => setDatas({...prev, devolucao: e.target.value})}/></div>
                            </div>

                            {/* SEÇÃO 3: PRODUTOS */}
                            <div>
                                <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-gray-700">3. Roupas</h4><button onClick={() => setModoProdutoManual(!modoProdutoManual)} className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">Item Manual</button></div>
                                {modoProdutoManual ? (
                                    <div className="flex flex-col md:flex-row gap-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                        <input placeholder="Nome" value={produtoManual.nome} onChange={e=>setProdutoManual({...produtoManual, nome:e.target.value})} className="border p-2 rounded flex-1"/>
                                        <div className="flex gap-2">
                                            <input placeholder="R$" type="number" value={produtoManual.preco} onChange={e=>setProdutoManual({...produtoManual, preco:e.target.value})} className="border p-2 rounded w-24"/>
                                            <button onClick={adicionarProdutoManual} className="bg-orange-500 text-white px-3 rounded font-bold flex-1">OK</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input placeholder="🔍 Buscar Roupa..." className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" value={termoProduto} onChange={e=>setTermoProduto(e.target.value)}/>
                                        {produtosEncontrados.length > 0 && <div className="absolute w-full bg-white shadow-xl border mt-1 max-h-48 overflow-auto z-10 rounded-lg">{produtosEncontrados.map(p => <div key={p.id} onClick={()=>verificarDisponibilidadeEAdicionar(p)} className="p-3 hover:bg-gray-100 cursor-pointer border-b flex justify-between"><span>{p.nome}</span> <span className="font-bold text-green-600">R$ {p.preco_aluguel}</span></div>)}</div>}
                                    </div>
                                )}
                                <div className="mt-3 space-y-2">{carrinho.map(item => <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="font-medium text-gray-700">{item.nome}</span><div className="flex items-center gap-3"><span className="font-bold text-gray-800">R$ {item.preco_aluguel}</span><button onClick={()=>setCarrinho(carrinho.filter(i=>i.id!==item.id))} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div></div>)}</div>
                            </div>

                            {/* ANOTAÇÕES */}
                            <div><h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2"><FileText size={16}/> Anotações</h4><textarea className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none" rows="2" placeholder="Ex: Ajustes na barra, cliente virá buscar..." value={anotacoes} onChange={e => setAnotacoes(e.target.value)}></textarea></div>

                            {/* PAGAMENTO */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between font-bold text-xl mb-3 text-slate-800"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1"><label className="text-xs font-bold text-gray-500">ENTRADA (R$)</label><input type="number" className="w-full p-2 border rounded-lg" value={pagamento.entrada} onChange={e=>setPagamento({...pagamento, entrada:e.target.value})}/></div>
                                    <div className="flex-1"><label className="text-xs font-bold text-gray-500">MÉTODO</label><select className="w-full p-2 border rounded-lg bg-white" value={pagamento.metodo} onChange={e=>setPagamento({...pagamento, metodo:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select></div>
                                </div>
                                <div className="text-right text-red-600 font-bold mt-2">Falta: R$ {valorRestante.toFixed(2)}</div>
                            </div>

                            <div className="pt-6 border-t flex flex-col md:flex-row justify-end gap-3">
                                <Link to="/alugueis" className="px-6 py-3 text-center text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</Link>
                                <button onClick={finalizarAluguel} disabled={loading || !dadosCliente.nome || carrinho.length === 0} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg w-full md:w-auto">{loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} Salvar Aluguel</button>
                            </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  )
}