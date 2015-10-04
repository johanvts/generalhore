// Learn more about F# at http://fsharp.org
// See the 'F# Tutorial' project for more help.
open FSharp.Data

let results = HtmlDocument.Load("http://raptekster.dk/forum/battle/freestyle-med-emner")

let links = 
    results.Descendants ["div"] |> Seq.filter (fun x -> x |> HtmlNode.hasClass ("field field-name-comment-body field-type-text-long field-label-hidden"))

let drop x = String.filter(fun c -> c <> x)

let innertext = links |> Seq.map (fun x -> HtmlNode.innerText x) |> Seq.map (drop '\\')

[<EntryPoint>]
let main argv = 
    printfn "%s" (String.concat "" innertext)
    0 // return an integer exit code
