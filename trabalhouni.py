
estoque = {}

def cadastrar_produto():
    nome = input("Nome da peça: ").strip().lower()
    quantidade = int(input("Quantidade inicial: "))
    preco = float(input("Preço da peça: R$ "))
    
    estoque[nome] = {
        "quantidade": quantidade,
        "preco": preco
    }
    
    print(f"✔ Produto '{nome}' cadastrado com sucesso!\n")


def adicionar_estoque():
    nome = input("Nome da peça para adicionar estoque: ").strip().lower()
    if nome not in estoque:
        print("❌ Produto não encontrado!")
        return
    
    qtd = int(input("Quantidade para adicionar: "))
    estoque[nome]["quantidade"] += qtd
    
    print(f"✔ Estoque atualizado! Agora há {estoque[nome]['quantidade']} unidades de '{nome}'.\n")


def remover_estoque():
    nome = input("Nome da peça para remover estoque: ").strip().lower()
    if nome not in estoque:
        print("❌ Produto não encontrado!")
        return
    
    qtd = int(input("Quantidade para remover: "))
    
    if qtd > estoque[nome]["quantidade"]:
        print("❌ Quantidade maior do que o estoque disponível!")
        return
    
    estoque[nome]["quantidade"] -= qtd
    
    print(f"✔ Estoque atualizado! Restam {estoque[nome]['quantidade']} unidades de '{nome}'.\n")


def listar_produtos():
    print("\n📦 LISTA DE PRODUTOS NO ESTOQUE:")
    
    if not estoque:
        print("Nenhum produto cadastrado.\n")
        return
    
    for nome, dados in estoque.items():
        print(f"- {nome.title()}: {dados['quantidade']} unidades | R$ {dados['preco']:.2f}")
    
    print()


def produtos_baixo_estoque():
    print("\n⚠ PRODUTOS COM BAIXO ESTOQUE (menos de 5 unidades):")
    encontrou = False
    
    for nome, dados in estoque.items():
        if dados["quantidade"] < 5:
            print(f"- {nome.title()}: {dados['quantidade']} unidades")
            encontrou = True
    
    if not encontrou:
        print("Nenhum produto com baixo estoque.\n")
    print()


while True:
    print("=== SISTEMA DE CONTROLE DE ESTOQUE ===")
    print("1 - Cadastrar produto")
    print("2 - Adicionar estoque")
    print("3 - Remover estoque")
    print("4 - Listar produtos")
    print("5 - Produtos com baixo estoque")
    print("0 - Sair")

    opcao = input("Escolha uma opção: ").strip()

    if opcao == "1":
        cadastrar_produto()
    elif opcao == "2":
        adicionar_estoque()
    elif opcao == "3":
        remover_estoque()
    elif opcao == "4":
        listar_produtos()
    elif opcao == "5":
        produtos_baixo_estoque()
    elif opcao == "0":
        print("Encerrando o sistema. Até mais!")
        break
    else:
        print("❌ Opção inválida! Tente novamente.\n")
