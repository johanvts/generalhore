module Sample
open System.Collections.Generic

let seqTake n (s:'a IEnumerator) = 
    let rec loop n = 
        seq {
            if n > 0 && s.MoveNext() then yield s.Current; yield! loop (n-1)
        }
    loop n

let seqWin n (s:'a seq) =
    use e = s.GetEnumerator()
    let rec loop () = 
        seq {
            let lst = e |> seqTake n  |> Seq.toList
            if lst.Length <= n && lst.Length > 0 then 
                yield lst            
                yield! loop() 
        }
    loop ()

let drop x = String.filter(fun c -> c <> x)
let droplinesWith s : string seq -> string seq = 
    Seq.filter(fun x -> not (x.Contains(s)))

let getVerses (raw_file:string) =
    let raw_strings = raw_file.Split [|'\n'|]
    let cleaned_strings = raw_strings |> droplinesWith @"[" |> droplinesWith @"---"
    let short_strings = cleaned_strings |> Seq.filter (fun s -> String.length s < 61)
    short_strings |> seqWin 4 |> List.ofSeq

let toJson input =
    let mutable flag = false
    printfn "[";
    let printverse verse =
        verse |> Seq.iter (fun line -> printfn "     \"%s \"," line)
    let rec printer vl =
        match vl with
        | [] ->  printfn "  ]"
        | verse::rest ->  
                if flag then printfn "  ],"
                printfn "  ["
                printverse verse
                flag <- true        
                printer rest
    printer input
    printfn "]"
